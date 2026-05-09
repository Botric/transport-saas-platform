import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteDeparture } from '../entities/route-departure.entity';
import { CreateDepartureDto } from './departures.dto';

const DAY_MAP: Record<number, keyof RouteDeparture['operatingDays']> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

@Injectable()
export class DeparturesService {
  constructor(
    @InjectRepository(RouteDeparture) private readonly departureRepo: Repository<RouteDeparture>,
  ) {}

  findByRoute(routeId: string) {
    return this.departureRepo.find({ where: { routeId, status: 'active' }, order: { departureTime: 'ASC' } });
  }

  async findNextHour(routeId: string) {
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

  async findOne(id: string) {
    const d = await this.departureRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Departure not found');
    return d;
  }

  create(dto: CreateDepartureDto) {
    const departure = this.departureRepo.create({ ...dto, status: 'active' });
    return this.departureRepo.save(departure);
  }

  async update(id: string, dto: Partial<CreateDepartureDto>) {
    const d = await this.findOne(id);
    Object.assign(d, dto);
    return this.departureRepo.save(d);
  }
}
