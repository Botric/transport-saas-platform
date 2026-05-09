import { IsNotEmpty, IsIn, IsOptional, IsNumber, IsDateString } from 'class-validator';

const LEVELS = ['empty', 'low', 'medium', 'high', 'full', 'unknown'] as const;

export class CapacityUpdateDto {
  @IsNotEmpty()
  sessionId: string;

  @IsIn(LEVELS)
  capacityLevel: string;

  @IsOptional()
  @IsNumber()
  capacityPercent?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
