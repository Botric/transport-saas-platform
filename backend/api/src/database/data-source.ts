/**
 * TypeORM DataSource for the migrations CLI.
 *
 * Used by:
 *   npm run migration:generate -- src/database/migrations/MigrationName
 *   npm run migration:run
 *   npm run migration:revert
 *
 * Reads connection settings from .env (same as the main app).
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Organisation } from '../entities/organisation.entity';
import { User } from '../entities/user.entity';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';
import { RouteDeparture } from '../entities/route-departure.entity';
import { DriverActivationCode } from '../entities/driver-activation-code.entity';
import { VehicleRegistration } from '../entities/vehicle-registration.entity';
import { DriverSession } from '../entities/driver-session.entity';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { CapacityUpdate } from '../entities/capacity-update.entity';
import { TicketProduct } from '../entities/ticket-product.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { ApiKey } from '../entities/api-key.entity';
import { AuditLog } from '../entities/audit-log.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME     ?? 'transport_saas',
  entities: [
    Organisation, User, Region, Route, RouteStop, RouteDeparture,
    DriverActivationCode, VehicleRegistration, DriverSession,
    TrackingPoint, CapacityUpdate, TicketProduct, TicketOrder,
    ApiKey, AuditLog,
  ],
  migrations: [path.join(__dirname, 'migrations', '*.ts')],
  synchronize: false,
  logging: true,
});
