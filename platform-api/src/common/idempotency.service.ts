// empty
import { AppDataSource } from "../db/typeorm.config";
import { IdempotencyKey } from "../entities/idempotency-key.entity";

export class IdempotencyService {
  static async has(key: string) {
    const repo = AppDataSource.getRepository(IdempotencyKey);
    return !!(await repo.findOne({ where: { key } }));
  }
  static async add(key: string) {
    const repo = AppDataSource.getRepository(IdempotencyKey);
    await repo.save({ key });
  }
}
