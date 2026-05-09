import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRegionDto {
  @IsOptional()
  organisationId?: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;
}
