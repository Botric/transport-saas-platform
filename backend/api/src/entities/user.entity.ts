import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';

export enum UserRole {
  SUPER_ADMIN      = 'super_admin',
  ORG_ADMIN        = 'org_admin',
  FINANCE          = 'finance',
  ROUTE_MANAGER    = 'route_manager',
  DRIVER_APP_MANAGER = 'driver_app_manager',
  CONTROL          = 'control',
  API_ADMIN        = 'api_admin',
  READ_ONLY        = 'read_only',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organisationId: string;

  @ManyToOne(() => Organisation, { nullable: true })
  @JoinColumn({ name: 'organisation_id' })
  organisation: Organisation;

  @Column({ length: 200 })
  name: string;

  @Column({ unique: true, length: 254 })
  email: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 30, default: UserRole.READ_ONLY })
  role: string;

  // FCM device token for push notifications
  @Column({ name: 'fcm_token', nullable: true, length: 500 })
  fcmToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
