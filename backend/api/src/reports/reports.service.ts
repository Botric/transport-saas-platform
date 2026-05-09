import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import AdmZip from 'adm-zip';
import { DriverSession } from '../entities/driver-session.entity';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';
import { RouteDeparture } from '../entities/route-departure.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DriverSession)   private sessionsRepo: Repository<DriverSession>,
    @InjectRepository(TrackingPoint)   private trackingRepo: Repository<TrackingPoint>,
    @InjectRepository(TicketOrder)     private ordersRepo: Repository<TicketOrder>,
    @InjectRepository(AuditLog)        private auditRepo: Repository<AuditLog>,
    @InjectRepository(Route)           private routesRepo: Repository<Route>,
    @InjectRepository(RouteStop)       private stopsRepo: Repository<RouteStop>,
    @InjectRepository(RouteDeparture)  private departuresRepo: Repository<RouteDeparture>,
    private apiKeysService: ApiKeysService,
  ) {}

  /** Validate API key from header and return it */
  async requireApiKey(header: string | undefined, scope: string) {
    if (!header) throw new UnauthorizedException('API key required');
    const plain = header.startsWith('Bearer ') ? header.slice(7) : header;
    return this.apiKeysService.validateKey(plain, scope);
  }

  // ── Live ──────────────────────────────────────────────────────────────────

  async getLiveRoutes() {
    const sessions = await this.sessionsRepo.find({
      where: { status: 'active' },
      relations: ['route'],
      order: { startedAt: 'DESC' },
    });
    return sessions.map((s) => ({
      sessionId: s.id,
      routeId: s.routeId,
      routeCode: s.route?.routeCode,
      routeName: s.route?.routeName,
      vehicleRegistration: s.vehicleRegistration,
      driverName: s.driverName,
      lastLat: s.lastLat,
      lastLon: s.lastLon,
      lastTrackingAt: s.lastTrackingAt,
      capacityLevel: s.lastCapacityLevel,
      startedAt: s.startedAt,
    }));
  }

  async getLiveVehicles() {
    return this.sessionsRepo.find({
      where: { status: 'active' },
      select: ['id', 'vehicleRegistration', 'lastLat', 'lastLon', 'lastTrackingAt', 'lastCapacityLevel', 'startedAt'],
      order: { lastTrackingAt: 'DESC' },
    });
  }

  // ── Historical ────────────────────────────────────────────────────────────

  async getHistoricalSessions(from?: string, to?: string) {
    const where: any = { status: 'ended' };
    if (from && to) {
      where.startedAt = Between(new Date(from), new Date(to));
    } else if (from) {
      where.startedAt = MoreThanOrEqual(new Date(from));
    } else if (to) {
      where.startedAt = LessThanOrEqual(new Date(to));
    }
    return this.sessionsRepo.find({
      where,
      relations: ['route'],
      order: { startedAt: 'DESC' },
      take: 500,
    });
  }

  // ── Finance CSV ───────────────────────────────────────────────────────────

  async financeExportCsv(from?: string, to?: string): Promise<string> {
    const where: any = {};
    if (from && to) where.createdAt = Between(new Date(from), new Date(to));
    else if (from) where.createdAt = MoreThanOrEqual(new Date(from));
    else if (to) where.createdAt = LessThanOrEqual(new Date(to));

    const orders = await this.ordersRepo.find({
      where,
      relations: ['ticketProduct', 'user'],
      order: { createdAt: 'ASC' },
    });

    const rows = orders.map((o) => [
      o.id,
      o.ticketCode,
      o.user?.name ?? '',
      o.user?.email ?? '',
      o.ticketProduct?.name ?? '',
      o.paymentStatus,
      o.paymentProvider ?? '',
      (o.amountPaid / 100).toFixed(2),
      o.status,
      o.validFrom ? new Date(o.validFrom).toISOString() : '',
      o.validUntil ? new Date(o.validUntil).toISOString() : '',
      new Date(o.createdAt).toISOString(),
    ]);

    const header = 'id,ticket_code,passenger_name,passenger_email,product,payment_status,payment_provider,amount_gbp,status,valid_from,valid_until,created_at';
    return [header, ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  }

  // ── Tracking CSV ──────────────────────────────────────────────────────────

  async trackingExportCsv(sessionId?: string, from?: string, to?: string): Promise<string> {
    const where: any = {};
    if (sessionId) where.driverSessionId = sessionId;
    if (from && to) where.serverTimestamp = Between(new Date(from), new Date(to));
    else if (from) where.serverTimestamp = MoreThanOrEqual(new Date(from));
    else if (to) where.serverTimestamp = LessThanOrEqual(new Date(to));

    const points = await this.trackingRepo.find({
      where,
      order: { serverTimestamp: 'ASC' },
      take: 50000,
    });

    const header = 'id,session_id,lat,lon,accuracy,speed,heading,server_timestamp';
    const rows = points.map((p) => [
      p.id,
      p.driverSessionId,
      p.lat,
      p.lon,
      p.accuracy ?? '',
      p.speed ?? '',
      p.heading ?? '',
      new Date(p.serverTimestamp).toISOString(),
    ]);
    return [header, ...rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  async getAuditLogs(limit = 200) {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 1000),
    });
  }

  // ── GTFS Export ───────────────────────────────────────────────────────────

  async getGtfsZip(): Promise<Buffer> {
    const [routes, stops, departures] = await Promise.all([
      this.routesRepo.find({ where: { status: 'active' }, order: { routeCode: 'ASC' } }),
      this.stopsRepo.find({ where: { status: 'active' }, order: { routeId: 'ASC', stopOrder: 'ASC' } }),
      this.departuresRepo.find({ where: { status: 'active' } }),
    ]);

    const csvEscape = (s: string) =>
      s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;

    const formatDate = (d: Date) => d.toISOString().replace(/-/g, '').slice(0, 8);
    const formatTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    };

    const today = formatDate(new Date());
    const nextYear = formatDate(new Date(Date.now() + 365 * 86400000));

    const zip = new AdmZip();

    // agency.txt
    zip.addFile('agency.txt', Buffer.from(
      'agency_id,agency_name,agency_url,agency_timezone\n1,Transport Platform,https://example.com,Europe/London\n',
      'utf8',
    ));

    // routes.txt (route_type 3 = bus)
    const routeLines = ['route_id,agency_id,route_short_name,route_long_name,route_type'];
    for (const r of routes) {
      routeLines.push(`${r.id},1,${csvEscape(r.routeCode)},${csvEscape(r.routeName)},3`);
    }
    zip.addFile('routes.txt', Buffer.from(routeLines.join('\n') + '\n', 'utf8'));

    // stops.txt
    const stopLines = ['stop_id,stop_name,stop_lat,stop_lon'];
    for (const s of stops) {
      if (s.lat != null && s.lon != null) {
        stopLines.push(`${s.id},${csvEscape(s.stopName)},${s.lat},${s.lon}`);
      }
    }
    zip.addFile('stops.txt', Buffer.from(stopLines.join('\n') + '\n', 'utf8'));

    // calendar.txt — one service_id per departure
    const calLines = [
      'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date',
    ];
    for (const d of departures) {
      const od = d.operatingDays ?? {};
      calLines.push([
        d.id,
        od.mon ? 1 : 0, od.tue ? 1 : 0, od.wed ? 1 : 0,
        od.thu ? 1 : 0, od.fri ? 1 : 0, od.sat ? 1 : 0, od.sun ? 1 : 0,
        d.validFrom ?? today, d.validTo ?? nextYear,
      ].join(','));
    }
    zip.addFile('calendar.txt', Buffer.from(calLines.join('\n') + '\n', 'utf8'));

    // trips.txt
    const tripLines = ['route_id,service_id,trip_id,trip_headsign'];
    for (const d of departures) {
      const route = routes.find((r) => r.id === d.routeId);
      tripLines.push(`${d.routeId},${d.id},${d.id},${csvEscape(route?.routeName ?? '')}`);
    }
    zip.addFile('trips.txt', Buffer.from(tripLines.join('\n') + '\n', 'utf8'));

    // stop_times.txt
    const stopsByRoute = new Map<string, typeof stops>();
    for (const s of stops) {
      if (!stopsByRoute.has(s.routeId)) stopsByRoute.set(s.routeId, []);
      stopsByRoute.get(s.routeId)!.push(s);
    }

    const stLines = ['trip_id,arrival_time,departure_time,stop_id,stop_sequence'];
    for (const dep of departures) {
      const routeStops = stopsByRoute.get(dep.routeId) ?? [];
      const [depH, depM] = dep.departureTime.split(':').map(Number);
      const depMins = depH * 60 + depM;
      for (const s of routeStops) {
        if (s.lat == null || s.lon == null) continue;
        const offset = s.plannedArrivalOffsetMinutes ?? 0;
        const t = formatTime(depMins + offset);
        stLines.push(`${dep.id},${t},${t},${s.id},${s.stopOrder}`);
      }
    }
    zip.addFile('stop_times.txt', Buffer.from(stLines.join('\n') + '\n', 'utf8'));

    // feed_info.txt (optional but recommended)
    zip.addFile('feed_info.txt', Buffer.from(
      'feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date\n' +
      `Transport Platform,https://example.com,en,${today},${nextYear}\n`,
      'utf8',
    ));

    return zip.toBuffer();
  }
}
