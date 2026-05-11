import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKey } from '../entities/api-key.entity';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';

type AuthenticatedUser = { id: string; role: string; organisationId: string | null };
function isGlobalAdmin(user: AuthenticatedUser) { return user.role === 'super_admin'; }

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey) private repo: Repository<ApiKey>,
  ) {}

  private hash(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
  }

  async list(user?: AuthenticatedUser) {
    const where: any = {};
    if (user && !isGlobalAdmin(user) && user.organisationId) {
      where.organisationId = user.organisationId;
    }
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateApiKeyDto, user?: AuthenticatedUser): Promise<ApiKey & { plainKey: string }> {
    if (user && !isGlobalAdmin(user) && !user.organisationId) {
      throw new ForbiddenException('User is not assigned to an organisation');
    }
    const organisationId = user
      ? (isGlobalAdmin(user) ? (dto.organisationId ?? user.organisationId ?? null) : user.organisationId)
      : null;

    // Generate a cryptographically secure key: "tsk_" prefix + 32 random hex bytes
    const plain = 'tsk_' + randomBytes(32).toString('hex');
    const keyHash = this.hash(plain);
    const keyPrefix = plain.slice(0, 12);

    const key = this.repo.create({
      name: dto.name,
      keyHash,
      keyPrefix,
      createdByUserId: userId,
      organisationId: organisationId ?? undefined,
      scopes: (dto.scopes ?? ['live:read']).join(','),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      status: 'active',
    });
    const saved = await this.repo.save(key);
    return { ...saved, plainKey: plain };
  }

  async update(id: string, dto: UpdateApiKeyDto, user?: AuthenticatedUser) {
    const key = await this.repo.findOneBy({ id });
    if (!key) throw new NotFoundException('API key not found');
    if (user && !isGlobalAdmin(user) && user.organisationId && key.organisationId !== user.organisationId) {
      throw new NotFoundException('API key not found');
    }
    Object.assign(key, dto);
    return this.repo.save(key);
  }

  async revoke(id: string, user?: AuthenticatedUser) {
    return this.update(id, { status: 'revoked' }, user);
  }

  /** Validate a raw API key sent in Authorization: Bearer header or X-API-Key header */
  async validateKey(plain: string, requiredScope: string): Promise<ApiKey> {
    const keyHash = this.hash(plain);
    const key = await this.repo.findOneBy({ keyHash, status: 'active' });
    if (!key) throw new UnauthorizedException('Invalid or revoked API key');
    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }
    if (!key.scopes.split(',').includes(requiredScope)) {
      throw new UnauthorizedException(`API key missing scope: ${requiredScope}`);
    }
    return key;
  }
}
