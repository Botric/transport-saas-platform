import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Route } from './route.entity';

@Entity('route_departures')
export class RouteDeparture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeId: string;

  @ManyToOne(() => Route)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({ name: 'departure_time', type: 'time' })
  departureTime: string;

  @Column({ name: 'operating_days_json', type: 'jsonb' })
  operatingDays: {
    mon: boolean; tue: boolean; wed: boolean;
    thu: boolean; fri: boolean; sat: boolean; sun: boolean;
  };

  @Column({ name: 'valid_from', type: 'date', nullable: true })
  validFrom: string;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
