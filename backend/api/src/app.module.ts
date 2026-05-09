import { Module } from '@nestjs/common';
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
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
