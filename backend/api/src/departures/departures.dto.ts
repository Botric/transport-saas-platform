import { IsNotEmpty, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateDepartureDto {
  @IsUUID()
  routeId: string;

  @IsNotEmpty()
  departureTime: string;

  operatingDays: {
    mon: boolean; tue: boolean; wed: boolean;
    thu: boolean; fri: boolean; sat: boolean; sun: boolean;
  };

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}
