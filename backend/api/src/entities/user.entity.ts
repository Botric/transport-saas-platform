import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
