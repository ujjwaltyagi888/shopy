// empty
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
@Entity({ name: 'orders' })
export class Order {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Merchant) @JoinColumn({ name: 'merchant_id' }) merchant!: Merchant;
@Column() shopify_order_id!: string;
@Column({ nullable: true }) shopify_order_number?: string;
@Column({ type: 'jsonb', nullable: true }) customer?: any;
@Column({ type: 'jsonb', nullable: true }) shipping_address?: any;
@Column({ type: 'jsonb', nullable: true }) billing_address?: any;
@Column({ default: false }) cod!: boolean;
@Column('bigint', { nullable: true }) total_paise?: number;
@Column({ default: 'INR' }) currency!: string;
@Column({ default: 'created' }) status!: string;
@Column({ type: 'text', nullable: true }) notes?: string;
@Column('text', { array: true, nullable: true }) tags?: string[];
@CreateDateColumn() created_at!: Date;
}
