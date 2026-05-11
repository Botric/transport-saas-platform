import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { CreateRegionDto } from './regions.dto';

type AuthenticatedUser = {
  id: string;
  role: string;
  organisationId: string | null;
};

function isGlobalAdmin(user: AuthenticatedUser) {
  return user.role === 'super_admin';
}

function requireOrganisationId(user: AuthenticatedUser) {
  if (!user.organisationId) {
    throw new ForbiddenException('User is not assigned to an organisation');
  }
  return user.organisationId;
}

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region) private readonly regionRepo: Repository<Region>,
  ) {}

  findAll(user: AuthenticatedUser) {
    const where = isGlobalAdmin(user)
      ? { status: 'active' }
      : { status: 'active', organisationId: requireOrganisationId(user) };
    return this.regionRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const where = isGlobalAdmin(user)
      ? { id }
      : { id, organisationId: requireOrganisationId(user) };
    const region = await this.regionRepo.findOne({ where });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  create(dto: CreateRegionDto, user: AuthenticatedUser) {
    const organisationId = isGlobalAdmin(user)
      ? (dto.organisationId ?? user.organisationId ?? undefined)
      : requireOrganisationId(user);

    const region = this.regionRepo.create({
      ...dto,
      ...(organisationId ? { organisationId } : {}),
      status: 'active',
    });
    return this.regionRepo.save(region);
  }

  async update(id: string, dto: Partial<CreateRegionDto>, user: AuthenticatedUser) {
    const region = await this.findOne(id, user);
    const nextOrganisationId = isGlobalAdmin(user)
      ? (dto.organisationId ?? region.organisationId)
      : region.organisationId;
    Object.assign(region, { ...dto, organisationId: nextOrganisationId });
    return this.regionRepo.save(region);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const region = await this.findOne(id, user);
    region.status = 'inactive';
    return this.regionRepo.save(region);
  }
}
