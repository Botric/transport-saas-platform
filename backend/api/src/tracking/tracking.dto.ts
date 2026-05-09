import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateTrackingPointDto {
  @IsNotEmpty()
  sessionId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  batteryLevel?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
