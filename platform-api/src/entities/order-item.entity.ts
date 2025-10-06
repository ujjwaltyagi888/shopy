// empty
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { MerchantListing } from './merchant-listing.entity';
@Entity({ name: 'order_items' })
export class OrderItem {
@PrimaryGeneratedColumn('uuid') id!: string;
@ManyToOne(() => Order, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'order_id' }) order!: Order;
@ManyToOne(() => Product) @JoinColumn({ name: 'product_id' }) product!: Product;
@ManyToOne(() => MerchantListing) @JoinColumn({ name: 'merchant_listing_id' }) listing!: MerchantListing;
@Column('int') quantity!: number;
@Column('bigint') unit_price_paise!: number;
}