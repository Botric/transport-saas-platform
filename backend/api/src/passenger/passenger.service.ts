import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import { RouteDeparture } from '../entities/route-departure.entity';
import { DriverSession } from '../entities/driver-session.entity';

const DAY_KEYS: Record<number, keyof RouteDeparture['operatingDays']> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

@Injectable()
export class PassengerService {
  constructor(
    @InjectRepository(Region) private readonly regionRepo: Repository<Region>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    @InjectRepository(RouteDeparture) private readonly departureRepo: Repository<RouteDeparture>,
    @InjectRepository(DriverSession) private readonly sessionRepo: Repository<DriverSession>,
  ) {}

  getRegions() {
    return this.regionRepo.find({ where: { status: 'active' }, order: { name: 'ASC' } });
  }

  getRoutes(regionId: string) {
    return this.routeRepo.find({
      where: { regionId, status: 'active', visibleToPassengers: true },
      order: { routeCode: 'ASC' },
    });
  }

  async getDepartures(routeId: string) {
    const now = new Date();
    const todayKey = DAY_KEYS[now.getDay()];
    const allDepartures = await this.departureRepo.find({
      where: { routeId, status: 'active' },
      order: { departureTime: 'ASC' },
    });
    return allDepartures.filter((d) => d.operatingDays[todayKey]);
  }

  async getLive(routeId: string) {
    const session = await this.sessionRepo.findOne({
      where: { routeId, status: 'active' },
      order: { startedAt: 'DESC' },
    });

    const now = new Date();
    const todayKey = DAY_KEYS[now.getDay()];
    const currentTimeStr = now.toTimeString().slice(0, 5);

    const allDepartures = await this.departureRepo.find({
      where: { routeId, status: 'active' },
      order: { departureTime: 'ASC' },
    });

    const todayDepartures = allDepartures.filter((d) => d.operatingDays[todayKey]);
    const nextDeparture = todayDepartures.find((d) => d.departureTime.slice(0, 5) >= currentTimeStr)
      ?? todayDepartures[0]
      ?? null;

    let delayMinutes: number | null = null;
    if (session?.startedAt && nextDeparture) {
      const scheduled = new Date(now.toDateString() + ' ' + nextDeparture.departureTime);
      delayMinutes = Math.round((session.startedAt.getTime() - scheduled.getTime()) / 60000);
    }

    return {
      session: session
        ? {
            id: session.id,
            vehicleRegistration: session.vehicleRegistration,
            lastLat: session.lastLat,
            lastLon: session.lastLon,
            lastTrackingAt: session.lastTrackingAt,
            lastCapacityLevel: session.lastCapacityLevel,
          }
        : null,
      nextDeparture: nextDeparture
        ? { id: nextDeparture.id, departureTime: nextDeparture.departureTime.slice(0, 5), delayMinutes }
        : null,
    };
  }
}
