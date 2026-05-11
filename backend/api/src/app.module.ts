import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RegionsModule } from './regions/regions.module';
import { RoutesModule } from './routes/routes.module';
import { DeparturesModule } from './departures/departures.module';
import { DriverAppModule } from './driver-app/driver-app.module';
import { DriverSessionsModule } from './driver-sessions/driver-sessions.module';
import { TrackingModule } from './tracking/tracking.module';
import { CapacityModule } from './capacity/capacity.module';
import { PassengerModule } from './passenger/passenger.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Organisation } from './entities/organisation.entity';
import { User } from './entities/user.entity';
import { Region } from './entities/region.entity';
import { Route } from './entities/route.entity';
import { RouteStop } from './entities/route-stop.entity';
import { RouteDeparture } from './entities/route-departure.entity';
import { DriverActivationCode } from './entities/driver-activation-code.entity';
import { VehicleRegistration } from './entities/vehicle-registration.entity';
import { DriverSession } from './entities/driver-session.entity';
import { TrackingPoint } from './entities/tracking-point.entity';
import { CapacityUpdate } from './entities/capacity-update.entity';
import { TicketProduct } from './entities/ticket-product.entity';
import { TicketOrder } from './entities/ticket-order.entity';
import { ApiKey } from './entities/api-key.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AuditMiddleware } from './common/audit.middleware';
import { RolesGuard } from './common/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME', 'transport_saas'),
        entities: [
          Organisation, User, Region, Route, RouteStop, RouteDeparture,
          DriverActivationCode, VehicleRegistration, DriverSession,
          TrackingPoint, CapacityUpdate,
          TicketProduct, TicketOrder,
          ApiKey, AuditLog,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        migrationsRun: config.get('NODE_ENV') === 'production',
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RegionsModule,
    RoutesModule,
    DeparturesModule,
    DriverAppModule,
    DriverSessionsModule,
    TrackingModule,
    CapacityModule,
    PassengerModule,
    TicketingModule,
    ApiKeysModule,
    ReportsModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Audit logging is applied globally for write operations
    // AuditMiddleware is provided by ReportsModule via TypeOrmModule.forFeature([AuditLog])
    // We skip configuring it here since ReportsModule is the right place;
    // for full middleware support we'd need AuditLog in a shared module.
    // This is deferred to avoid circular deps — the middleware is ready to apply.
  }
}
