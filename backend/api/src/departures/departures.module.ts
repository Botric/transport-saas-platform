import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeparturesController } from './departures.controller';
import { DeparturesService } from './departures.service';
import { RouteDeparture } from '../entities/route-departure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RouteDeparture])],
  controllers: [DeparturesController],
  providers: [DeparturesService],
  exports: [DeparturesService],
})
export class DeparturesModule {}
