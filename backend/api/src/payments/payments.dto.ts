import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  @IsNotEmpty()
  ticketProductId: string;
}

export class ConfirmPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  paymentIntentId: string;
}
