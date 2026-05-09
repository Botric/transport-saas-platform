import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { Region } from './region.entity';

@Entity('driver_activation_codes')
export class DriverActivationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organisationId: string;

  @ManyToOne(() => Organisation, { nullable: true })
  @JoinColumn({ name: 'organisation_id' })
  organisation: Organisation;

  @Column({ nullable: true })
  regionId: string;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ nullable: true })
  supplierId: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'max_uses', nullable: true })
  maxUses: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
