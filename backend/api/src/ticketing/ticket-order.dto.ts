import { IsString, IsUUID } from 'class-validator';

export class ClaimTicketDto {
  @IsString()
  @IsUUID()
  ticketProductId: string;
}
