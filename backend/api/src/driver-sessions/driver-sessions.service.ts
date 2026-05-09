import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverSession } from '../entities/driver-session.entity';
import { CreateDriverSessionDto } from './driver-sessions.dto';

@Injectable()
export class DriverSessionsService {
  constructor(
    @InjectRepository(DriverSession) private readonly sessionRepo: Repository<DriverSession>,
  ) {}

  async create(dto: CreateDriverSessionDto) {
    const session = this.sessionRepo.create({
      ...dto,
      status: 'active',
      startedAt: new Date(),
    });
    return this.sessionRepo.save(session);
  }

  findActiveSessions() {
    return this.sessionRepo.find({
      where: { status: 'active' },
      relations: ['route', 'departure'],
      order: { startedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const session = await this.sessionRepo.findOne({ where: { id }, relations: ['route', 'departure'] });
    if (!session) throw new NotFoundException('Driver session not found');
    return session;
  }

  async end(id: string) {
    const session = await this.findOne(id);
    session.status = 'completed';
    session.endedAt = new Date();
    return this.sessionRepo.save(session);
  }

  async updateLocation(id: string, lat: number, lon: number, capacityLevel?: string) {
    await this.sessionRepo.update(id, {
      lastLat: lat,
      lastLon: lon,
      lastTrackingAt: new Date(),
      ...(capacityLevel ? { lastCapacityLevel: capacityLevel } : {}),
    });
  }
}
