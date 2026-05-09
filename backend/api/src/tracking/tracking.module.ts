import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { DriverSessionsModule } from '../driver-sessions/driver-sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingPoint]), DriverSessionsModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
