import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapacityController } from './capacity.controller';
import { CapacityService } from './capacity.service';
import { CapacityUpdate } from '../entities/capacity-update.entity';
import { DriverSessionsModule } from '../driver-sessions/driver-sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([CapacityUpdate]), DriverSessionsModule],
  controllers: [CapacityController],
  providers: [CapacityService],
})
export class CapacityModule {}
