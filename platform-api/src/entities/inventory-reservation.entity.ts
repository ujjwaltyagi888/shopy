import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
import { Order } from './order.entity';
@Entity({ name: 'inventory_reservations' })
export class InventoryReservation {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Product, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product!: Product;
@ManyToOne(() => Order, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'order_id' }) order!: Order;
@ManyToOne(() => Warehouse, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'warehouse_id' }) warehouse?: Warehouse;
@Column('int') quantity!: number;
@Column({ default: 'open' }) status!: 'open' | 'consumed' | 'released';
@CreateDateColumn() created_at!: Date;
@Column({ type: 'timestamptz', nullable: true }) consumed_at?: Date;
@Column({ type: 'timestamptz', nullable: true }) released_at?: Date;
}
