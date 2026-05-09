import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverSession } from '../entities/driver-session.entity';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';
import { RouteDeparture } from '../entities/route-departure.entity';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ReportsService } from './reports.service';
import { PartnerController, ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverSession, TrackingPoint, TicketOrder, AuditLog, Route, RouteStop, RouteDeparture]),
    AuthModule,
    ApiKeysModule,
  ],
  providers: [ReportsService],
  controllers: [PartnerController, ReportsController],
})
export class ReportsModule {}
