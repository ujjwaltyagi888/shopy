import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
@Entity({ name: 'inventory' })
export class Inventory {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Product, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product!: Product;
@ManyToOne(() => Warehouse, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'warehouse_id' }) warehouse!: Warehouse;
@Column('int', { default: 0 }) quantity!: number;
@UpdateDateColumn() updated_at!: Date;
}
