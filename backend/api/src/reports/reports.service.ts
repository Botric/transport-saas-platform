import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { DriverSession } from '../entities/driver-session.entity';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { Route } from '../entities/route.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DriverSession)  private sessionsRepo: Repository<DriverSession>,
    @InjectRepository(TrackingPoint)  private trackingRepo: Repository<TrackingPoint>,
    @InjectRepository(TicketOrder)    private ordersRepo: Repository<TicketOrder>,
    @InjectRepository(AuditLog)       private auditRepo: Repository<AuditLog>,
    @InjectRepository(Route)          private routesRepo: Repository<Route>,
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
}
