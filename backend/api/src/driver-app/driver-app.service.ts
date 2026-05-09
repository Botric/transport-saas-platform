import {
  Injectable, BadRequestException, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DriverActivationCode } from '../entities/driver-activation-code.entity';
import { VehicleRegistration } from '../entities/vehicle-registration.entity';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import {
  ActivateDto, DriverDetailsDto,
  CreateActivationCodeDto, UpdateActivationCodeDto,
  CreateVehicleRegistrationDto, UpdateVehicleRegistrationDto,
} from './driver-app.dto';
import { DeparturesService } from '../departures/departures.service';

const UK_REG_RE = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$|^[A-Z]{2}[0-9]{2,3}$|^[A-Z0-9]{2,7}$/i;

@Injectable()
export class DriverAppService {
  constructor(
    @InjectRepository(DriverActivationCode) private readonly codeRepo: Repository<DriverActivationCode>,
    @InjectRepository(VehicleRegistration) private readonly vehicleRepo: Repository<VehicleRegistration>,
    @InjectRepository(Region) private readonly regionRepo: Repository<Region>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly departuresService: DeparturesService,
  ) {}

  async activate(dto: ActivateDto) {
    const code = await this.codeRepo.findOne({
      where: { code: dto.code.toUpperCase(), status: 'active' },
      relations: ['region'],
    });

    if (!code) throw new NotFoundException('Activation code not found or inactive');
    if (code.expiresAt && new Date() > code.expiresAt) {
      throw new BadRequestException('Activation code has expired');
    }
    if (code.maxUses !== null && code.usedCount >= code.maxUses) {
      throw new BadRequestException('Activation code usage limit reached');
    }

    code.usedCount += 1;
    await this.codeRepo.save(code);

    const allowedRegions = code.regionId ? [code.regionId] : [];
    const expiresIn = this.config.get<string>('ACTIVATION_TOKEN_EXPIRES_IN', '12h');
    const activationToken = this.jwtService.sign(
      { sub: code.id, organisationId: code.organisationId, allowedRegions, type: 'driver-activation' },
      { secret: this.config.get<string>('ACTIVATION_TOKEN_SECRET'), expiresIn: expiresIn as any },
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12);

    return {
      activationToken,
      organisationId: code.organisationId,
      allowedRegions,
      expiresAt: expiresAt.toISOString(),
    };
  }

  validateActivationToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get<string>('ACTIVATION_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired activation token');
    }
  }

  async getVehicles(regionId?: string) {
    const query = this.vehicleRepo.createQueryBuilder('v').where('v.status = :status', { status: 'active' });
    if (regionId) query.andWhere('v.regionId = :regionId', { regionId });
    return query.orderBy('v.registration', 'ASC').getMany();
  }

  validateVehicleReg(reg: string) {
    const cleaned = reg.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!UK_REG_RE.test(cleaned)) throw new BadRequestException('Invalid UK vehicle registration');
    return cleaned;
  }

  submitDriverDetails(dto: DriverDetailsDto) {
    this.validateActivationToken(dto.activationToken);
    const reg = this.validateVehicleReg(dto.vehicleRegistration);
    return { accepted: true, vehicleRegistration: reg, driverName: dto.driverName.trim() };
  }

  getRegions(allowedRegionIds?: string[]) {
    if (allowedRegionIds?.length) {
      return this.regionRepo.findByIds(allowedRegionIds);
    }
    return this.regionRepo.find({ where: { status: 'active' }, order: { name: 'ASC' } });
  }

  getRoutesByRegion(regionId: string) {
    return this.routeRepo.find({ where: { regionId, status: 'active' }, order: { routeCode: 'ASC' } });
  }

  getDepartures(routeId: string, window?: string) {
    if (window === 'next-hour') return this.departuresService.findNextHour(routeId);
    return this.departuresService.findByRoute(routeId);
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  async listActivationCodes() {
    return this.codeRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createActivationCode(dto: CreateActivationCodeDto) {
    const code = this.codeRepo.create({
      code: dto.code.toUpperCase(),
      regionId: dto.regionId,
      maxUses: dto.maxUses,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      status: 'active',
    });
    return this.codeRepo.save(code);
  }

  async updateActivationCode(id: string, dto: UpdateActivationCodeDto) {
    const code = await this.codeRepo.findOneBy({ id });
    if (!code) throw new NotFoundException('Activation code not found');
    Object.assign(code, dto);
    return this.codeRepo.save(code);
  }

  async createVehicleRegistration(dto: CreateVehicleRegistrationDto) {
    const vehicle = this.vehicleRepo.create({
      registration: dto.registration.toUpperCase().trim(),
      vehicleName: dto.vehicleName,
      capacity: dto.capacity,
      regionId: dto.regionId,
      status: 'active',
    });
    return this.vehicleRepo.save(vehicle);
  }

  async updateVehicleRegistration(id: string, dto: UpdateVehicleRegistrationDto) {
    const vehicle = await this.vehicleRepo.findOneBy({ id });
    if (!vehicle) throw new NotFoundException('Vehicle registration not found');
    if (dto.registration) dto.registration = dto.registration.toUpperCase().trim();
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }
}
