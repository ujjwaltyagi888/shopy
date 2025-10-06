// empty
import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';
@Entity({ name: 'idempotency_keys' })
export class IdempotencyKey {
@PrimaryColumn() key!: string;
@CreateDateColumn() created_at!: Date;
}