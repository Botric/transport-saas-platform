import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(AuditLog) private repo: Repository<AuditLog>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Only audit write operations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      return next();
    }

    res.on('finish', () => {
      const user = (req as any).user;
      const actor = user?.id ?? (req.headers['x-api-key'] ? 'api_key' : 'anonymous');
      const log = this.repo.create({
        actor,
        action: `${req.method} ${req.path}`,
        statusCode: res.statusCode,
        ipAddress: req.ip ?? req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      this.repo.save(log).catch(() => { /* non-blocking */ });
    });

    next();
  }
}
