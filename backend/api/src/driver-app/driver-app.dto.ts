import { IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

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

export class CreateActivationCodeDto {
  @IsNotEmpty()
  code: string;

  @IsOptional()
  regionId?: string;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateActivationCodeDto {
  @IsOptional()
  status?: string;
}

export class CreateVehicleRegistrationDto {
  @IsNotEmpty()
  registration: string;

  @IsOptional()
  vehicleName?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  regionId?: string;
}

export class UpdateVehicleRegistrationDto {
  @IsOptional()
  registration?: string;

  @IsOptional()
  vehicleName?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  regionId?: string;

  @IsOptional()
  status?: string;
}
