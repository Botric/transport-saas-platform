import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsIn, Min } from 'class-validator';

export class CreateTicketProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsBoolean()
  isFree: boolean;

  @IsIn(['single', 'day', 'week', 'month', 'custom'])
  validityType: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsBoolean()
  visible: boolean;

  @IsArray()
  @IsString({ each: true })
  routeIds: string[];
}

export class UpdateTicketProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsIn(['single', 'day', 'week', 'month', 'custom'])
  validityType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  routeIds?: string[];
}
