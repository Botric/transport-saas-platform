import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { CreateRouteDto } from './routes.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
  ) {}

  findAll() {
    return this.routeRepo.find({ where: { status: 'active' }, order: { routeCode: 'ASC' } });
  }

  findByRegion(regionId: string) {
    return this.routeRepo.find({ where: { regionId, status: 'active' }, order: { routeCode: 'ASC' } });
  }

  async findOne(id: string) {
    const route = await this.routeRepo.findOne({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  create(dto: CreateRouteDto) {
    const route = this.routeRepo.create({ ...dto, status: 'active' });
    return this.routeRepo.save(route);
  }

  async update(id: string, dto: Partial<CreateRouteDto>) {
    const route = await this.findOne(id);
    Object.assign(route, dto);
    return this.routeRepo.save(route);
  }

  async remove(id: string) {
    const route = await this.findOne(id);
    route.status = 'inactive';
    return this.routeRepo.save(route);
  }
}
