import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  // Stored as SHA-256 hash; the plaintext is only shown once at creation
  @Column({ name: 'key_hash', unique: true, length: 64 })
  keyHash: string;

  // First 8 chars of the plaintext key, shown in the UI as a hint
  @Column({ name: 'key_prefix', length: 12 })
  keyPrefix: string;

  @Column({ name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @Column({ name: 'organisation_id', nullable: true })
  organisationId: string;

  // Comma-separated scopes: live:read, history:read, finance:read, tracking:read
  @Column({ type: 'text', default: 'live:read' })
  scopes: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
