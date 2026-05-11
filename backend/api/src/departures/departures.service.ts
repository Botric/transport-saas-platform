import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteDeparture } from '../entities/route-departure.entity';
import { Route } from '../entities/route.entity';
import { CreateDepartureDto } from './departures.dto';

const DAY_MAP: Record<number, keyof RouteDeparture['operatingDays']> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

@Injectable()
export class DeparturesService {
  constructor(
    @InjectRepository(RouteDeparture) private readonly departureRepo: Repository<RouteDeparture>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
  ) {}

  private isGlobalAdmin(user?: { role: string }) {
    return user?.role === 'super_admin';
  }

  private requireOrganisationId(user: { organisationId: string | null }) {
    if (!user.organisationId) {
      throw new ForbiddenException('User is not assigned to an organisation');
    }
    return user.organisationId;
  }

  private async getScopedRoute(
    routeId: string,
    user?: { role: string; organisationId: string | null },
  ) {
    const where = this.isGlobalAdmin(user) || !user
      ? { id: routeId }
      : { id: routeId, organisationId: this.requireOrganisationId(user) };
    const route = await this.routeRepo.findOne({ where });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async findByRoute(
    routeId: string,
    user?: { role: string; organisationId: string | null },
  ) {
    if (user) {
      await this.getScopedRoute(routeId, user);
    }
    return this.departureRepo.find({ where: { routeId, status: 'active' }, order: { departureTime: 'ASC' } });
  }

  async findNextHour(
    routeId: string,
    user?: { role: string; organisationId: string | null },
  ) {
    if (user) {
      await this.getScopedRoute(routeId, user);
    }
    const now = new Date();
    const todayKey = DAY_MAP[now.getDay()];
    const cutoffTime = new Date(now.getTime() + 60 * 60 * 1000);
    const hh = String(cutoffTime.getHours()).padStart(2, '0');
    const mm = String(cutoffTime.getMinutes()).padStart(2, '0');
    const cutoff = `${hh}:${mm}:00`;
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const all = await this.departureRepo.find({ where: { routeId, status: 'active' }, order: { departureTime: 'ASC' } });
    return all.filter(d => d.operatingDays[todayKey] && d.departureTime >= nowTime && d.departureTime <= cutoff);
  }

  async findOne(id: string, user?: { role: string; organisationId: string | null }) {
    const d = await this.departureRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Departure not found');
    if (user) {
      await this.getScopedRoute(d.routeId, user);
    }
    return d;
  }

  async create(
    dto: CreateDepartureDto,
    user: { role: string; organisationId: string | null },
  ) {
    await this.getScopedRoute(dto.routeId, user);
    const departure = this.departureRepo.create({ ...dto, status: 'active' });
    return this.departureRepo.save(departure);
  }

  async update(
    id: string,
    dto: Partial<CreateDepartureDto>,
    user: { role: string; organisationId: string | null },
  ) {
    const d = await this.findOne(id, user);
    if (dto.routeId && dto.routeId !== d.routeId) {
      await this.getScopedRoute(dto.routeId, user);
    }
    Object.assign(d, dto);
    return this.departureRepo.save(d);
  }
}
