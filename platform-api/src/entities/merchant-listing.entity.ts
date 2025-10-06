// empty
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';
@Entity({ name: 'merchant_listings' })
export class MerchantListing {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Merchant) @JoinColumn({ name: 'merchant_id' }) merchant!: Merchant;
@ManyToOne(() => Product) @JoinColumn({ name: 'product_id' }) product!: Product;
@Column({ nullable: true }) shopify_product_id?: string;
@Column({ nullable: true }) shopify_variant_id?: string;
@Column('bigint') retail_price_paise!: number;
@Column({ default: 'tracked' }) inventory_policy!: string;
@Column({ default: 'active' }) status!: string;
@CreateDateColumn() created_at!: Date;
}