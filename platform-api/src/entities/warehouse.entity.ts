import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity({ name: 'warehouses' })
export class Warehouse {
@PrimaryGeneratedColumn('uuid') id!: string;
@Column({ unique: true }) code!: string;
@Column() name!: string;
@Column({ type: 'jsonb', nullable: true }) address?: any;
@Column({ default: true }) active!: boolean;
@CreateDateColumn() created_at!: Date;
}
