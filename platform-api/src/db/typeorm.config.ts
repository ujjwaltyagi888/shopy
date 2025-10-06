import { DataSource } from "typeorm";
import { Merchant } from "../entities/merchant.entity";
import { Product } from "../entities/product.entity";
import { MerchantListing } from "../entities/merchant-listing.entity";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Shipment } from "../entities/shipment.entity";
import { IdempotencyKey } from "../entities/idempotency-key.entity";
import { Inventory } from "../entities/inventory.entity";
import { ConfigService } from "../config/config.service";

const cfg = new ConfigService();
export const AppDataSource = new DataSource({
  type: "postgres",
  url: cfg.databaseUrl,
  ssl: false,
  entities: [
    Merchant,
    Product,
    MerchantListing,
    Order,
    OrderItem,
    Shipment,
    IdempotencyKey,
    Inventory,
  ],
  synchronize: false,
});
