// empty
// config.service.ts

import * as dotenv from 'dotenv';
dotenv.config();
export class ConfigService {
  readonly port = Number(process.env.PORT ?? 4000);
  readonly databaseUrl = process.env.DATABASE_URL!;
  readonly redisUrl = process.env.REDIS_URL!;
  readonly shopifyWebhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  readonly merchantDomain = process.env.MERCHANT_DOMAIN;

  // Shopify Admin API
  readonly shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  readonly shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  readonly shopifyApiVersion =
    process.env.SHOPIFY_API_VERSION || '2024-10';
}
