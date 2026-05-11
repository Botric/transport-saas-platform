import {
  Controller, Post, Get, Body, Param, Req, UseGuards,
  Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Step 1 — Passenger creates a hosted Stripe Checkout Session for a paid ticket.
   * Returns a checkout URL that can be opened in the device browser.
   */
  @UseGuards(JwtAuthGuard)
  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  createIntent(@Req() req: any, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createCheckoutSession(req.user.id, dto.ticketProductId);
  }

  /**
   * Poll order status after payment — passenger app calls this to confirm
   * the Stripe webhook has fulfilled the order.
   */
  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.getOrder(id, req.user.id);
  }

  /**
   * Stripe webhook — must receive the raw body.
   * Add this URL in the Stripe Dashboard > Webhooks.
  * Events to subscribe: checkout.session.completed, checkout.session.expired
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }
}
