import { IsNotEmpty, IsOptional } from 'class-validator';

export class ActivateDto {
  @IsNotEmpty()
  code: string;

  @IsOptional()
  deviceId?: string;
}

export class DriverDetailsDto {
  @IsNotEmpty()
  activationToken: string;

  @IsNotEmpty()
  driverName: string;

  @IsNotEmpty()
  vehicleRegistration: string;
}
