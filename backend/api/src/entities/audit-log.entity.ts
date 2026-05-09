import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who performed the action (user id or 'api_key:<id>')
  @Column({ name: 'actor', length: 200, nullable: true })
  actor: string;

  // HTTP method + path: "POST /ticketing/products"
  @Column({ name: 'action', length: 300 })
  action: string;

  // HTTP response status
  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number;

  // Target resource id if present
  @Column({ name: 'resource_id', length: 200, nullable: true })
  resourceId: string;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
