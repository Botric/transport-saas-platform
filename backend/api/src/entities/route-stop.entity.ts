import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Route } from './route.entity';

@Entity('route_stops')
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeId: string;

  @ManyToOne(() => Route)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({ name: 'stop_order' })
  stopOrder: number;

  @Column({ name: 'stop_name', length: 200 })
  stopName: string;

  @Column({ nullable: true, length: 300 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lon: number;

  @Column({ name: 'planned_arrival_offset_minutes', nullable: true })
  plannedArrivalOffsetMinutes: number;

  @Column({ name: 'planned_departure_offset_minutes', nullable: true })
  plannedDepartureOffsetMinutes: number;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
