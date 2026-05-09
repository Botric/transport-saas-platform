import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TicketProduct } from './ticket-product.entity';

@Entity('ticket_orders')
export class TicketOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'ticket_product_id' })
  ticketProductId: string;

  @ManyToOne(() => TicketProduct)
  @JoinColumn({ name: 'ticket_product_id' })
  ticketProduct: TicketProduct;

  // pending | paid | cancelled | refunded
  @Column({ name: 'payment_status', length: 20, default: 'pending' })
  paymentStatus: string;

  // not_required | stripe
  @Column({ name: 'payment_provider', length: 30, nullable: true })
  paymentProvider: string;

  @Column({ name: 'payment_reference', length: 200, nullable: true })
  paymentReference: string;

  // Total charged in pence/cents
  @Column({ name: 'amount_paid', type: 'int', default: 0 })
  amountPaid: number;

  // 8-char uppercase alphanumeric code displayed as the ticket
  @Column({ name: 'ticket_code', length: 20, unique: true })
  ticketCode: string;

  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil: Date;

  // active | expired | used | cancelled
  @Column({ length: 20, default: 'active' })
  status: string;

  // Boarding validation — set when driver scans ticket
  @Column({ name: 'boarded_at', type: 'timestamptz', nullable: true })
  boardedAt: Date;

  @Column({ name: 'boarded_session_id', nullable: true })
  boardedSessionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
