import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { CreateRegionDto } from './regions.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region) private readonly regionRepo: Repository<Region>,
  ) {}

  findAll() {
    return this.regionRepo.find({ where: { status: 'active' }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const region = await this.regionRepo.findOne({ where: { id } });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  create(dto: CreateRegionDto) {
    const region = this.regionRepo.create({ ...dto, status: 'active' });
    return this.regionRepo.save(region);
  }

  async update(id: string, dto: Partial<CreateRegionDto>) {
    const region = await this.findOne(id);
    Object.assign(region, dto);
    return this.regionRepo.save(region);
  }

  async remove(id: string) {
    const region = await this.findOne(id);
    region.status = 'inactive';
    return this.regionRepo.save(region);
  }
}
