import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDriverSessionDto {
  @IsUUID()
  routeId: string;

  @IsOptional()
  @IsUUID()
  departureId?: string;

  @IsNotEmpty()
  driverName: string;

  @IsNotEmpty()
  vehicleRegistration: string;

  @IsOptional()
  deviceId?: string;

  @IsOptional()
  activationToken?: string;
}
