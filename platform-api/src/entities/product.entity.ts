import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity({ name: 'products' })
export class Product {
@PrimaryGeneratedColumn('uuid') id!: string;
@Column({ unique: true }) sku!: string;
@Column() title!: string;
@Column({ nullable: true, type: 'text' }) description?: string;
@Column({ nullable: true }) hsn_code?: string;
@Column({ nullable: true, type: 'int' }) gst_rate?: number;
@Column('bigint') price_paise!: number;
@Column({ nullable: true, type: 'int' }) weight_grams?: number;
@Column({ nullable: true, type: 'jsonb' }) dimensions?: any;
@Column({ nullable: true, type: 'jsonb' }) images?: any;
@Column({ default: true }) active!: boolean;
@CreateDateColumn() created_at!: Date;
@Column({ nullable: true }) shopify_product_id?: string;
}
