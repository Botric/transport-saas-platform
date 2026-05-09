import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapacityUpdate } from '../entities/capacity-update.entity';
import { DriverSessionsService } from '../driver-sessions/driver-sessions.service';
import { CapacityUpdateDto } from './capacity.dto';

@Injectable()
export class CapacityService {
  constructor(
    @InjectRepository(CapacityUpdate) private readonly capacityRepo: Repository<CapacityUpdate>,
    private readonly sessionsService: DriverSessionsService,
  ) {}

  async update(dto: CapacityUpdateDto) {
    const record = this.capacityRepo.create({
      driverSessionId: dto.sessionId,
      capacityLevel: dto.capacityLevel,
      capacityPercent: dto.capacityPercent,
      deviceTimestamp: dto.timestamp ? new Date(dto.timestamp) : undefined,
      serverTimestamp: new Date(),
    });
    await this.capacityRepo.save(record);
    const session = await this.sessionsService.findOne(dto.sessionId);
    await this.sessionsService.updateLocation(dto.sessionId, session.lastLat, session.lastLon, dto.capacityLevel);
    return { accepted: true };
  }

  getSessionCapacityHistory(sessionId: string) {
    return this.capacityRepo.find({
      where: { driverSessionId: sessionId },
      order: { createdAt: 'DESC' },
    });
  }
}
