import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
@Entity({ name: 'inventory_movements' })
export class InventoryMovement {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Product, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product!: Product;
@ManyToOne(() => Warehouse, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'warehouse_id' }) warehouse?: Warehouse;
@Column('int') change!: number; // +/-
@Column({ nullable: true }) reason?: string;
@Column({ nullable: true }) ref_type?: string;
@Column({ nullable: true }) ref_id?: string;
@CreateDateColumn() created_at!: Date;
}
