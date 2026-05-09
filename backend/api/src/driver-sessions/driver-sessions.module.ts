import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverSessionsController } from './driver-sessions.controller';
import { DriverSessionsService } from './driver-sessions.service';
import { DriverSession } from '../entities/driver-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverSession])],
  controllers: [DriverSessionsController],
  providers: [DriverSessionsService],
  exports: [DriverSessionsService],
})
export class DriverSessionsModule {}
