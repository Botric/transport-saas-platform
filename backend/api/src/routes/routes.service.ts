import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { Region } from '../entities/region.entity';
import { CreateRouteDto } from './routes.dto';

type AuthenticatedUser = {
  id: string;
  role: string;
  organisationId: string | null;
};

function isGlobalAdmin(user?: AuthenticatedUser) {
  return user?.role === 'super_admin';
}

function requireOrganisationId(user: AuthenticatedUser) {
  if (!user.organisationId) {
    throw new ForbiddenException('User is not assigned to an organisation');
  }
  return user.organisationId;
}

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    @InjectRepository(Region) private readonly regionRepo: Repository<Region>,
  ) {}

  findAll(user?: AuthenticatedUser) {
    const where = isGlobalAdmin(user) || !user
      ? { status: 'active' }
      : { status: 'active', organisationId: requireOrganisationId(user) };
    return this.routeRepo.find({ where, order: { routeCode: 'ASC' } });
  }

  findByRegion(regionId: string, user?: AuthenticatedUser) {
    const where = isGlobalAdmin(user) || !user
      ? { regionId, status: 'active' }
      : { regionId, status: 'active', organisationId: requireOrganisationId(user) };
    return this.routeRepo.find({ where, order: { routeCode: 'ASC' } });
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const where = isGlobalAdmin(user) || !user
      ? { id }
      : { id, organisationId: requireOrganisationId(user) };
    const route = await this.routeRepo.findOne({ where });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async create(dto: CreateRouteDto, user: AuthenticatedUser) {
    const regionWhere = isGlobalAdmin(user)
      ? { id: dto.regionId }
      : { id: dto.regionId, organisationId: requireOrganisationId(user) };
    const region = await this.regionRepo.findOne({ where: regionWhere });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const organisationId = isGlobalAdmin(user)
      ? (dto.organisationId ?? region.organisationId ?? user.organisationId ?? undefined)
      : requireOrganisationId(user);

    const route = this.routeRepo.create({
      ...dto,
      ...(organisationId ? { organisationId } : {}),
      status: 'active',
    });
    return this.routeRepo.save(route);
  }

  async update(id: string, dto: Partial<CreateRouteDto>, user: AuthenticatedUser) {
    const route = await this.findOne(id, user);

    if (dto.regionId && dto.regionId !== route.regionId) {
      const regionWhere = isGlobalAdmin(user)
        ? { id: dto.regionId }
        : { id: dto.regionId, organisationId: requireOrganisationId(user) };
      const region = await this.regionRepo.findOne({ where: regionWhere });
      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    const organisationId = isGlobalAdmin(user)
      ? (dto.organisationId ?? route.organisationId)
      : route.organisationId;

    Object.assign(route, {
      ...dto,
      ...(organisationId ? { organisationId } : {}),
    });
    return this.routeRepo.save(route);
  }

  async remove(id: string, user?: AuthenticatedUser) {
    const route = await this.findOne(id, user);
    route.status = 'inactive';
    return this.routeRepo.save(route);
  }
}
