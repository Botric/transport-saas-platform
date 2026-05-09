import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DriverAppController } from './driver-app.controller';
import { DriverAppService } from './driver-app.service';
import { DriverActivationCode } from '../entities/driver-activation-code.entity';
import { VehicleRegistration } from '../entities/vehicle-registration.entity';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import { DeparturesModule } from '../departures/departures.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverActivationCode, VehicleRegistration, Region, Route]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACTIVATION_TOKEN_SECRET'),
        signOptions: { expiresIn: config.get<string>('ACTIVATION_TOKEN_EXPIRES_IN', '12h') as any },
      }),
      inject: [ConfigService],
    }),
    DeparturesModule,
  ],
  controllers: [DriverAppController],
  providers: [DriverAppService],
  exports: [DriverAppService],
})
export class DriverAppModule {}
