import { BullModule } from '@nestjs/bullmq';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AppConfigModule } from '../config/config.module';
import { ShopifyModule } from '../shopify/shopify.module';
import { ShopifySyncProcessor } from './shopify-sync.processor';

@Module({
  imports: [
    AppConfigModule,
    ShopifyModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('BullMQ');
        const url = new URL(configService.redisUrl);
        logger.log(`Connecting to Redis at ${url.hostname}:${url.port}`);
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'create-shipment',
    }),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
  ],
  providers: [ShopifySyncProcessor],
})
export class QueuesModule {}
