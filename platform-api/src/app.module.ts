// empty

import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { WebhooksModule } from "./webhooks/webhooks.module";


@Module({imports: [AppConfigModule, WebhooksModule]})
export class AppModule {}