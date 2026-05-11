import { Test, TestingModule } from '@nestjs/testing';
import { TicketingService } from './ticketing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketProduct } from '../entities/ticket-product.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { DriverSession } from '../entities/driver-session.entity';
import { Route } from '../entities/route.entity';
import { NotFoundException } from '@nestjs/common';

const makeProduct = (overrides: Partial<TicketProduct> = {}) =>
  ({
    id: 'prod-1',
    name: 'Day Pass',
    price: 0,
    isFree: true,
    validityType: 'day',
    maxUses: null,
    visible: true,
    status: 'active',
    routes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    organisationId: null,
    ...overrides,
  } as unknown as TicketProduct);

const makeOrder = (overrides: Partial<TicketOrder> = {}) =>
  ({
    id: 'order-1',
    userId: 'user-1',
    ticketCode: 'ABC12345',
    status: 'active',
    paymentStatus: 'not_required',
    amountPaid: 0,
    validUntil: new Date(Date.now() + 86_400_000),
    validFrom: new Date(),
    createdAt: new Date(),
    ...overrides,
  } as unknown as TicketOrder);

const makeSession = (overrides: Partial<DriverSession> = {}) =>
  ({ id: 'session-1', status: 'active', ...overrides } as DriverSession);

describe('TicketingService', () => {
  let service: TicketingService;

  const productsRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const ordersRepo   = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const sessionsRepo = { findOne: jest.fn() };
  const routesRepo   = { findBy: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        { provide: getRepositoryToken(TicketProduct),  useValue: productsRepo },
        { provide: getRepositoryToken(TicketOrder),    useValue: ordersRepo },
        { provide: getRepositoryToken(DriverSession),  useValue: sessionsRepo },
        { provide: getRepositoryToken(Route),          useValue: routesRepo },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
    jest.clearAllMocks();
  });

  describe('claimFreeTicket()', () => {
    it('should throw NotFoundException for unknown product', async () => {
      productsRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.claimFreeTicket('user-1', { ticketProductId: 'bad' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should create an active ticket order for a free product', async () => {
      productsRepo.findOne.mockResolvedValue(makeProduct());
      ordersRepo.findOne.mockResolvedValueOnce(null); // code uniqueness check
      const saved = makeOrder();
      ordersRepo.create.mockReturnValue(saved);
      ordersRepo.save.mockResolvedValue(saved);

      const result = await service.claimFreeTicket('user-1', { ticketProductId: 'prod-1' });

      expect(result.status).toBe('active');
      expect(result.paymentStatus).toBe('not_required');
      expect(ordersRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateTicket()', () => {
    it('should return invalid if session not found', async () => {
      sessionsRepo.findOne.mockResolvedValueOnce(null);
      const result = await service.validateTicket('ABC12345', 'bad-session');
      expect(result.valid).toBe(false);
    });

    it('should return invalid if ticket not found', async () => {
      sessionsRepo.findOne.mockResolvedValueOnce(makeSession());
      ordersRepo.findOne.mockResolvedValueOnce(null);
      const result = await service.validateTicket('NOTFOUND', 'session-1');
      expect(result.valid).toBe(false);
    });

    it('should return invalid if ticket already used', async () => {
      sessionsRepo.findOne.mockResolvedValueOnce(makeSession());
      ordersRepo.findOne.mockResolvedValueOnce(makeOrder({ status: 'used' as any }));
      const result = await service.validateTicket('ABC12345', 'session-1');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/already used/i);
    });

    it('should return invalid for an expired ticket', async () => {
      sessionsRepo.findOne.mockResolvedValueOnce(makeSession());
      ordersRepo.findOne.mockResolvedValueOnce(
        makeOrder({ validUntil: new Date(Date.now() - 1000) }),
      );
      const result = await service.validateTicket('ABC12345', 'session-1');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/expired/i);
    });

    it('should mark ticket as used and return valid for a good ticket', async () => {
      sessionsRepo.findOne.mockResolvedValueOnce(makeSession());
      const order = makeOrder();
      ordersRepo.findOne.mockResolvedValueOnce(order);
      ordersRepo.save.mockResolvedValueOnce({ ...order, status: 'used' });

      const result = await service.validateTicket('ABC12345', 'session-1');

      expect(result.valid).toBe(true);
      expect(ordersRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
