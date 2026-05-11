import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { TicketProduct } from '../entities/ticket-product.entity';
import { TicketOrder } from '../entities/ticket-order.entity';

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function computeValidity(validityType: string): { validFrom: Date; validUntil: Date } {
  const now = new Date();
  const from = new Date(now);
  const until = new Date(now);
  switch (validityType) {
    case 'day':   until.setDate(until.getDate() + 1); break;
    case 'week':  until.setDate(until.getDate() + 7); break;
    case 'month': until.setMonth(until.getMonth() + 1); break;
    default:      until.setHours(until.getHours() + 24); break;
  }
  return { validFrom: from, validUntil: until };
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null = null;
  private readonly webhookSecret: string | null;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(TicketProduct) private productsRepo: Repository<TicketProduct>,
    @InjectRepository(TicketOrder)   private ordersRepo: Repository<TicketOrder>,
  ) {
    const secretKey = config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && secretKey.startsWith('sk_')) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured — paid ticket payments are disabled.',
      );
    }
    this.webhookSecret = config.get<string>('STRIPE_WEBHOOK_SECRET') ?? null;
  }

  get isEnabled(): boolean {
    return this.stripe !== null;
  }

  private getCheckoutSuccessUrl() {
    return this.config.get<string>(
      'STRIPE_CHECKOUT_SUCCESS_URL',
      'https://example.com/payments/success',
    );
  }

  private getCheckoutCancelUrl() {
    return this.config.get<string>(
      'STRIPE_CHECKOUT_CANCEL_URL',
      'https://example.com/payments/cancel',
    );
  }

  /**
   * Step 1: Passenger calls this to get a hosted Stripe Checkout Session URL.
   * The passenger app opens the URL in a browser and the webhook marks the order paid.
   */
  async createCheckoutSession(userId: string, ticketProductId: string) {
    if (!this.stripe) {
      throw new BadRequestException(
        'Payment processing is not configured on this server.',
      );
    }

    const product = await this.productsRepo.findOne({ where: { id: ticketProductId } });
    if (!product) throw new NotFoundException('Ticket product not found');
    if (product.price === 0 || product.isFree) {
      throw new BadRequestException('Use the claim endpoint for free tickets');
    }
    if (product.status !== 'active' || !product.visible) {
      throw new BadRequestException('This ticket product is not available');
    }

    // Create a pending order immediately so we can track the intent
    let ticketCode: string;
    let exists = true;
    do {
      ticketCode = generateTicketCode();
      exists = !!(await this.ordersRepo.findOne({ where: { ticketCode } }));
    } while (exists);

    const { validFrom, validUntil } = computeValidity(product.validityType);

    const order = this.ordersRepo.create({
      userId,
      ticketProductId: product.id,
      paymentStatus: 'pending',
      paymentProvider: 'stripe',
      amountPaid: 0,
      ticketCode,
      validFrom,
      validUntil,
      status: 'pending_payment',
    });
    await this.ordersRepo.save(order);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${this.getCheckoutSuccessUrl()}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.getCheckoutCancelUrl(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: product.price,
            product_data: {
              name: product.name,
              ...(product.description ? { description: product.description } : {}),
            },
          },
        },
      ],
      metadata: {
        orderId: order.id,
        userId,
        ticketProductId,
        ticketCode,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          userId,
          ticketProductId,
          ticketCode,
        },
      },
    });

    order.paymentReference = session.id;
    await this.ordersRepo.save(order);

    return {
      checkoutUrl: session.url,
      orderId: order.id,
      amount: product.price,
      currency: 'gbp',
    };
  }

  /**
   * Stripe webhook — called by Stripe when a payment is completed or fails.
   * The raw body must be passed unmodified for signature verification.
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe || !this.webhookSecret) {
      throw new BadRequestException('Stripe not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillOrder(session);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.cancelOrder(session.metadata?.orderId);
    }

    return { received: true };
  }

  private async fulfillOrder(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(`Checkout session ${session.id} missing orderId metadata`);
      return;
    }

    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`No order found for checkout session ${session.id}`);
      return;
    }

    order.paymentStatus = 'paid';
    order.amountPaid = session.amount_total ?? order.amountPaid;
    order.paymentReference = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : order.paymentReference;
    order.status = 'active';
    await this.ordersRepo.save(order);
    this.logger.log(`Order ${order.id} fulfilled via Stripe checkout`);
  }

  private async cancelOrder(orderId?: string) {
    if (!orderId) {
      return;
    }

    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) return;
    order.paymentStatus = 'cancelled';
    order.status = 'cancelled';
    await this.ordersRepo.save(order);
    this.logger.log(`Order ${order.id} cancelled — checkout expired`);
  }

  /** Get a single order — used by passenger app to poll for payment completion */
  async getOrder(orderId: string, userId: string) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId, userId },
      relations: ['ticketProduct'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
