import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { Region } from './region.entity';

@Entity('vehicle_registrations')
export class VehicleRegistration {
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

  @Column({ length: 20 })
  registration: string;

  @Column({ name: 'vehicle_name', nullable: true, length: 200 })
  vehicleName: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
