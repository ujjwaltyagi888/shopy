// empty
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
@Entity({ name: 'shipments' })
export class Shipment {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Order, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'order_id' }) order!: Order;
@Column({ nullable: true }) provider?: string;
@Column({ nullable: true }) awb?: string;
@Column({ nullable: true }) label_url?: string;
@Column({ nullable: true }) tracking_url?: string;
@Column({ nullable: true }) status?: string;
@Column({ default: false }) rto!: boolean;
@CreateDateColumn() created_at!: Date;
}