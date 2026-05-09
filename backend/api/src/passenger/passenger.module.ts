import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import { RouteDeparture } from '../entities/route-departure.entity';
import { DriverSession } from '../entities/driver-session.entity';
import { PassengerController } from './passenger.controller';
import { PassengerService } from './passenger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Region, Route, RouteDeparture, DriverSession])],
  controllers: [PassengerController],
  providers: [PassengerService],
})
export class PassengerModule {}
