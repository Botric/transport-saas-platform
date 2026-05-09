import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { Region } from './region.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organisationId: string;

  @ManyToOne(() => Organisation, { nullable: true })
  @JoinColumn({ name: 'organisation_id' })
  organisation: Organisation;

  @Column()
  regionId: string;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'route_code', length: 50 })
  routeCode: string;

  @Column({ name: 'route_name', length: 200 })
  routeName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ name: 'ticket_required', default: false })
  ticketRequired: boolean;

  @Column({ name: 'visible_to_passengers', default: true })
  visibleToPassengers: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
