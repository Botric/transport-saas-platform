import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { DriverSessionsService } from '../driver-sessions/driver-sessions.service';
import { CreateTrackingPointDto } from './tracking.dto';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingPoint) private readonly pointRepo: Repository<TrackingPoint>,
    private readonly sessionsService: DriverSessionsService,
  ) {}

  async addPoint(dto: CreateTrackingPointDto) {
    const point = this.pointRepo.create({
      driverSessionId: dto.sessionId,
      lat: dto.lat,
      lon: dto.lon,
      speed: dto.speed,
      heading: dto.heading,
      accuracy: dto.accuracy,
      batteryLevel: dto.batteryLevel,
      deviceTimestamp: dto.timestamp ? new Date(dto.timestamp) : undefined,
      serverTimestamp: new Date(),
    });
    await this.pointRepo.save(point);
    await this.sessionsService.updateLocation(dto.sessionId, dto.lat, dto.lon);
    return { accepted: true };
  }

  getSessionPoints(sessionId: string) {
    return this.pointRepo.find({
      where: { driverSessionId: sessionId },
      order: { createdAt: 'ASC' },
    });
  }
}
