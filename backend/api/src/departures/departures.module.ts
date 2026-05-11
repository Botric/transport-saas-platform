import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeparturesController } from './departures.controller';
import { DeparturesService } from './departures.service';
import { RouteDeparture } from '../entities/route-departure.entity';
import { Route } from '../entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RouteDeparture, Route])],
  controllers: [DeparturesController],
  providers: [DeparturesService],
  exports: [DeparturesService],
})
export class DeparturesModule {}
