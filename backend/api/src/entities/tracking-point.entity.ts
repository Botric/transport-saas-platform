import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { DriverSession } from './driver-session.entity';

@Entity('tracking_points')
export class TrackingPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  driverSessionId: string;

  @ManyToOne(() => DriverSession)
  @JoinColumn({ name: 'driver_session_id' })
  driverSession: DriverSession;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lon: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  speed: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  heading: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  accuracy: number;

  @Column({ name: 'battery_level', nullable: true })
  batteryLevel: number;

  @Column({ name: 'device_timestamp', type: 'timestamptz', nullable: true })
  deviceTimestamp: Date;

  @Column({ name: 'server_timestamp', type: 'timestamptz', default: () => 'NOW()' })
  serverTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
