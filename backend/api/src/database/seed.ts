/**
 * Admin Seed Script
 * Creates the first super admin user so you can log in to a fresh installation.
 *
 * Usage:
 *   cd backend/api
 *   npx ts-node -r tsconfig-paths/register src/database/seed.ts
 *
 * Or with npm:
 *   npm run seed
 *
 * Environment variables are read from .env in the same way as the main app.
 * Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to override the defaults.
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import all entities
import { User, UserRole } from '../entities/user.entity';
import { Organisation } from '../entities/organisation.entity';
import { Region } from '../entities/region.entity';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';
import { RouteDeparture } from '../entities/route-departure.entity';
import { DriverActivationCode } from '../entities/driver-activation-code.entity';
import { VehicleRegistration } from '../entities/vehicle-registration.entity';
import { DriverSession } from '../entities/driver-session.entity';
import { TrackingPoint } from '../entities/tracking-point.entity';
import { CapacityUpdate } from '../entities/capacity-update.entity';
import { TicketProduct } from '../entities/ticket-product.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { ApiKey } from '../entities/api-key.entity';
import { AuditLog } from '../entities/audit-log.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME     ?? 'transport_saas',
  entities: [
    Organisation, User, Region, Route, RouteStop, RouteDeparture,
    DriverActivationCode, VehicleRegistration, DriverSession,
    TrackingPoint, CapacityUpdate, TicketProduct, TicketOrder,
    ApiKey, AuditLog,
  ],
  synchronize: false,
});

async function seed() {
  console.log('Connecting to database…');
  await dataSource.initialize();

  const userRepo       = dataSource.getRepository(User);
  const orgRepo        = dataSource.getRepository(Organisation);

  // ── Create default organisation ────────────────────────────────────────────
  let org = await orgRepo.findOne({ where: { name: 'Default Organisation' } });
  if (!org) {
    org = orgRepo.create({ name: 'Default Organisation' });
    await orgRepo.save(org);
    console.log('✓ Created organisation: Default Organisation');
  } else {
    console.log('  Organisation already exists, skipping.');
  }

  // ── Create super admin ─────────────────────────────────────────────────────
  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';
  const adminName     = process.env.SEED_ADMIN_NAME     ?? 'Super Admin';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    // Promote to super_admin if not already
    if (existing.role !== UserRole.SUPER_ADMIN) {
      existing.role = UserRole.SUPER_ADMIN;
      existing.organisationId = org.id;
      await userRepo.save(existing);
      console.log(`✓ Promoted existing user ${adminEmail} to super_admin`);
    } else {
      console.log(`  Super admin ${adminEmail} already exists, skipping.`);
    }
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = userRepo.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: 'active',
      organisationId: org.id,
    });
    await userRepo.save(admin);
    console.log(`✓ Created super admin: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  IMPORTANT: Change this password after first login.');
  }

  await dataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
