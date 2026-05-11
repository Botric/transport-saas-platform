import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Route } from './route.entity';

@Entity('ticket_products')
export class TicketProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organisation_id', nullable: true })
  organisationId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Price in pence/cents (integer). 0 for free tickets.
  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  // single | day | week | month | custom
  @Column({ name: 'validity_type', length: 20, default: 'single' })
  validityType: string;

  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number;

  @Column({ name: 'visible', default: true })
  visible: boolean;

  @Column({ length: 20, default: 'active' })
  status: string;

  @ManyToMany(() => Route, { eager: false })
  @JoinTable({
    name: 'ticket_product_routes',
    joinColumn: { name: 'ticket_product_id' },
    inverseJoinColumn: { name: 'route_id' },
  })
  routes: Route[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
