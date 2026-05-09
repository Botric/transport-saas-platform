import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { DriverSession } from './driver-session.entity';

@Entity('capacity_updates')
export class CapacityUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  driverSessionId: string;

  @ManyToOne(() => DriverSession)
  @JoinColumn({ name: 'driver_session_id' })
  driverSession: DriverSession;

  @Column({ name: 'capacity_level', length: 20 })
  capacityLevel: string;

  @Column({ name: 'capacity_percent', nullable: true })
  capacityPercent: number;

  @Column({ name: 'updated_by', nullable: true, length: 50 })
  updatedBy: string;

  @Column({ name: 'device_timestamp', type: 'timestamptz', nullable: true })
  deviceTimestamp: Date;

  @Column({ name: 'server_timestamp', type: 'timestamptz', default: () => 'NOW()' })
  serverTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
