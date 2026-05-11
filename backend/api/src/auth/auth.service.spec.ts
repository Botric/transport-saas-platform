import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Minimal in-memory user store for tests
const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    organisationId: null,
    name: 'Test User',
    email: 'test@example.com',
    phone: null,
    passwordHash: bcrypt.hashSync('Password1!', 10),
    role: UserRole.READ_ONLY,
    fcmToken: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User);

describe('AuthService', () => {
  let service: AuthService;

  const userRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should throw ConflictException if email already exists', async () => {
      userRepo.findOne.mockResolvedValueOnce(makeUser());
      await expect(
        service.register({ name: 'Alice', email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should create a new user and return a token', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      const saved = makeUser({ role: UserRole.READ_ONLY });
      userRepo.create.mockReturnValueOnce(saved);
      userRepo.save.mockResolvedValueOnce(saved);

      const result = await service.register({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(userRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('login()', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.login({ email: 'bad@example.com', password: 'any' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      userRepo.findOne.mockResolvedValueOnce(makeUser());
      await expect(service.login({ email: 'test@example.com', password: 'WrongPass!' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      userRepo.findOne.mockResolvedValueOnce(makeUser({ status: 'inactive' as any }));
      await expect(service.login({ email: 'test@example.com', password: 'Password1!' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should return a token for valid credentials', async () => {
      userRepo.findOne.mockResolvedValueOnce(makeUser());
      const result = await service.login({ email: 'test@example.com', password: 'Password1!' });
      expect(result.accessToken).toBe('signed-token');
    });
  });
});
