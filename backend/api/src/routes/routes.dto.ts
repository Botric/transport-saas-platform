import { IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateRouteDto {
  @IsOptional()
  organisationId?: string;

  @IsUUID()
  regionId: string;

  @IsNotEmpty()
  routeCode: string;

  @IsNotEmpty()
  routeName: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  ticketRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  visibleToPassengers?: boolean;
}
