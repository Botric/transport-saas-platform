import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { Route } from './route.entity';
import { RouteDeparture } from './route-departure.entity';
import { DriverActivationCode } from './driver-activation-code.entity';

@Entity('driver_sessions')
export class DriverSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organisationId: string;

  @ManyToOne(() => Organisation, { nullable: true })
  @JoinColumn({ name: 'organisation_id' })
  organisation: Organisation;

  @Column({ nullable: true })
  activationCodeId: string;

  @ManyToOne(() => DriverActivationCode, { nullable: true })
  @JoinColumn({ name: 'activation_code_id' })
  activationCode: DriverActivationCode;

  @Column()
  routeId: string;

  @ManyToOne(() => Route)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({ nullable: true })
  departureId: string;

  @ManyToOne(() => RouteDeparture, { nullable: true })
  @JoinColumn({ name: 'departure_id' })
  departure: RouteDeparture;

  @Column({ name: 'driver_name', length: 200 })
  driverName: string;

  @Column({ name: 'vehicle_registration', length: 20 })
  vehicleRegistration: string;

  @Column({ name: 'device_id', nullable: true, length: 200 })
  deviceId: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date;

  @Column({ name: 'last_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLat: number;

  @Column({ name: 'last_lon', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLon: number;

  @Column({ name: 'last_tracking_at', type: 'timestamptz', nullable: true })
  lastTrackingAt: Date;

  @Column({ name: 'last_capacity_level', nullable: true, length: 20 })
  lastCapacityLevel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
