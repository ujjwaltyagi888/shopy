import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity({ name: 'merchants' })
export class Merchant {
@PrimaryGeneratedColumn('uuid') id!: string;
@Column({ name: "shop_domain", type: "text", unique: true }) shopDomain!: string;
@Column({ name: "shopify_access_token", type: "text", nullable: true }) shopifyAccessToken?: string;
@Column({ name: "business_name", type: "text", nullable: true }) businessName?: string;
@Column({ name: "contact_email", type: "text", nullable: true }) contactEmail?: string;
@Column({ type: "text", nullable: true }) gstin?: string;
@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}
