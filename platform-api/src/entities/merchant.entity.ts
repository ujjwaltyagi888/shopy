import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity({ name: 'merchants' })
export class Merchant {
@PrimaryGeneratedColumn('uuid') id!: string;
@Column({ unique: true }) shop_domain!: string;
@Column({ nullable: true }) shopify_access_token?: string;
@Column({ nullable: true }) business_name?: string;
@Column({ nullable: true }) contact_email?: string;
@Column({ nullable: true }) gstin?: string;
@CreateDateColumn() created_at!: Date;
}
