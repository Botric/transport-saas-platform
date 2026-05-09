import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKey } from '../entities/api-key.entity';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey) private repo: Repository<ApiKey>,
  ) {}

  private hash(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
  }

  async list() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateApiKeyDto): Promise<ApiKey & { plainKey: string }> {
    // Generate a cryptographically secure key: "tsk_" prefix + 32 random hex bytes
    const plain = 'tsk_' + randomBytes(32).toString('hex');
    const keyHash = this.hash(plain);
    const keyPrefix = plain.slice(0, 12);

    const key = this.repo.create({
      name: dto.name,
      keyHash,
      keyPrefix,
      createdByUserId: userId,
      scopes: (dto.scopes ?? ['live:read']).join(','),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      status: 'active',
    });
    const saved = await this.repo.save(key);
    return { ...saved, plainKey: plain };
  }

  async update(id: string, dto: UpdateApiKeyDto) {
    const key = await this.repo.findOneBy({ id });
    if (!key) throw new NotFoundException('API key not found');
    Object.assign(key, dto);
    return this.repo.save(key);
  }

  async revoke(id: string) {
    return this.update(id, { status: 'revoked' });
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
