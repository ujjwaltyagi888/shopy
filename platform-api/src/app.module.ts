// empty

import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { CatalogueModule } from "./catalogue/catalogue.module";
import { ListingsModule } from "./listings/listings.module";
import { OrdersModule } from "./orders/orders.module";
import { QueuesModule } from "./queues/queues.module";


@Module({imports: [AppConfigModule, WebhooksModule, CatalogueModule, ListingsModule, OrdersModule, QueuesModule]})
export class AppModule {}
