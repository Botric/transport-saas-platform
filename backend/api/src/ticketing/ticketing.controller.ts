import {
  Controller, Get, Post, Patch, Body, Param, Req, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { TicketingService } from './ticketing.service';
import { CreateTicketProductDto, UpdateTicketProductDto } from './ticket-product.dto';
import { ClaimTicketDto } from './ticket-order.dto';

@Controller('ticketing')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  // ── Admin: Ticket Products (JWT required) ─────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('products')
  listProducts() {
    return this.ticketingService.listProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.ticketingService.getProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products')
  createProduct(@Body() dto: CreateTicketProductDto) {
    return this.ticketingService.createProduct(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateTicketProductDto) {
    return this.ticketingService.updateProduct(id, dto);
  }

  // ── Admin: All orders ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  listOrders() {
    return this.ticketingService.listOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.ticketingService.getOrder(id);
  }

  // ── Passenger: my tickets (JWT required) ─────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('my/orders')
  myOrders(@Req() req: any) {
    return this.ticketingService.listMyOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/orders/:id')
  myOrder(@Param('id') id: string, @Req() req: any) {
    return this.ticketingService.getOrder(id, req.user.id);
  }

  // ── Passenger: public products list (no JWT needed) ───────────────────────
  // Returns only visible+active products so passenger app can show available tickets

  @Get('public/products')
  publicProducts() {
    return this.ticketingService.listProducts().then((products) =>
      products.filter((p) => p.visible && p.status === 'active'),
    );
  }

  // ── Passenger: claim free ticket ─────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('my/claim')
  @HttpCode(HttpStatus.CREATED)
  claimTicket(@Req() req: any, @Body() dto: ClaimTicketDto) {
    return this.ticketingService.claimFreeTicket(req.user.id, dto);
  }
  // ── Driver: boarding validation (no JWT — driver uses session token) ───────

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validateTicket(@Body() body: { ticketCode: string; sessionId: string }) {
    return this.ticketingService.validateTicket(body.ticketCode, body.sessionId);
  }}
