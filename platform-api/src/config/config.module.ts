// empty
import * as dotenv from 'dotenv'
dotenv.config();

export class ConfigService {
    readonly port = Number(process.env.PORT ?? 4000);
    readonly databaseUrl = process.env.DATABASE_URL;
    readonly redisUrl = process.env.REDIS_URL;
    readonly shopifyWebhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET!;
}