import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TicketProduct } from '../entities/ticket-product.entity';
import { Route } from '../entities/route.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { DriverSession } from '../entities/driver-session.entity';
import { CreateTicketProductDto, UpdateTicketProductDto } from './ticket-product.dto';
import { ClaimTicketDto } from './ticket-order.dto';

type AuthenticatedUser = { id: string; role: string; organisationId: string | null };
function isGlobalAdmin(user: AuthenticatedUser) { return user.role === 'super_admin'; }

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
    case 'day':    until.setDate(until.getDate() + 1); break;
    case 'week':   until.setDate(until.getDate() + 7); break;
    case 'month':  until.setMonth(until.getMonth() + 1); break;
    case 'single':
    default:       until.setHours(until.getHours() + 24); break;
  }
  return { validFrom: from, validUntil: until };
}

@Injectable()
export class TicketingService {
  constructor(
    @InjectRepository(TicketProduct) private productsRepo: Repository<TicketProduct>,
    @InjectRepository(Route)         private routesRepo: Repository<Route>,
    @InjectRepository(TicketOrder)   private ordersRepo: Repository<TicketOrder>,
    @InjectRepository(DriverSession) private sessionsRepo: Repository<DriverSession>,
  ) {}

  // ── Ticket Products ────────────────────────────────────────────────────────

  async listProducts(user?: AuthenticatedUser) {
    const where: any = {};
    if (user && !isGlobalAdmin(user) && user.organisationId) {
      where.organisationId = user.organisationId;
    }
    return this.productsRepo.find({ where, relations: ['routes'], order: { createdAt: 'DESC' } });
  }

  async getProduct(id: string, user?: AuthenticatedUser) {
    const p = await this.productsRepo.findOne({ where: { id }, relations: ['routes'] });
    if (!p) throw new NotFoundException('Ticket product not found');
    if (user && !isGlobalAdmin(user) && user.organisationId && p.organisationId !== user.organisationId) {
      throw new NotFoundException('Ticket product not found');
    }
    return p;
  }

  async createProduct(dto: CreateTicketProductDto, user?: AuthenticatedUser) {
    if (user && !isGlobalAdmin(user) && !user.organisationId) {
      throw new ForbiddenException('User is not assigned to an organisation');
    }
    const organisationId = user
      ? (isGlobalAdmin(user)
          ? (dto.organisationId ?? user.organisationId ?? null)
          : user.organisationId)
      : null;
    const routes = dto.routeIds?.length
      ? await this.routesRepo.findBy({ id: In(dto.routeIds) })
      : [];
    const product = this.productsRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      isFree: dto.isFree,
      validityType: dto.validityType,
      maxUses: dto.maxUses,
      visible: dto.visible,
      organisationId: organisationId ?? undefined,
      routes,
    });
    return this.productsRepo.save(product);
  }

  async updateProduct(id: string, dto: UpdateTicketProductDto, user?: AuthenticatedUser) {
    const product = await this.getProduct(id, user);
    if (dto.routeIds !== undefined) {
      product.routes = dto.routeIds.length
        ? await this.routesRepo.findBy({ id: In(dto.routeIds) })
        : [];
    }
    Object.assign(product, {
      name:         dto.name         ?? product.name,
      description:  dto.description  ?? product.description,
      price:        dto.price        ?? product.price,
      isFree:       dto.isFree       ?? product.isFree,
      validityType: dto.validityType ?? product.validityType,
      maxUses:      dto.maxUses      ?? product.maxUses,
      visible:      dto.visible      ?? product.visible,
      status:       dto.status       ?? product.status,
    });
    return this.productsRepo.save(product);
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async listOrders() {
    return this.ordersRepo.find({
      relations: ['user', 'ticketProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  async listMyOrders(userId: string) {
    return this.ordersRepo.find({
      where: { userId },
      relations: ['ticketProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrder(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const order = await this.ordersRepo.findOne({ where, relations: ['ticketProduct', 'user'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async claimFreeTicket(userId: string, dto: ClaimTicketDto) {
    const product = await this.getProduct(dto.ticketProductId);

    // Ensure ticket code is unique
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
      paymentStatus: 'not_required',
      paymentProvider: null as any,
      amountPaid: 0,
      ticketCode,
      validFrom,
      validUntil,
      status: 'active',
    });
    return this.ordersRepo.save(order);
  }

  // ── Boarding validation ────────────────────────────────────────────────────

  async validateTicket(ticketCode: string, sessionId: string) {
    // Verify the session is active (prevents random guessing without a live session)
    const session = await this.sessionsRepo.findOne({ where: { id: sessionId, status: 'active' } });
    if (!session) {
      return { valid: false, message: 'Session not found or no longer active' };
    }

    const order = await this.ordersRepo.findOne({
      where: { ticketCode: ticketCode.toUpperCase() },
      relations: ['ticketProduct', 'user'],
    });
    if (!order) return { valid: false, message: 'Ticket not found' };
    if (order.status === 'used') return { valid: false, message: 'Ticket already used' };
    if (order.status !== 'active') return { valid: false, message: `Ticket is ${order.status}` };
    if (order.validUntil && new Date() > order.validUntil) {
      return { valid: false, message: 'Ticket has expired' };
    }

    order.status = 'used';
    order.boardedAt = new Date();
    order.boardedSessionId = sessionId;
    await this.ordersRepo.save(order);

    return {
      valid: true,
      message: 'Ticket accepted — have a good journey',
      ticketCode: order.ticketCode,
      passenger: order.user?.name ?? null,
    };
  }
}
