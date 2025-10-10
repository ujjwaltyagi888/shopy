import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ShopifyModule } from '../shopify/shopify.module';
import { QueuesModule } from '../queues/queues.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ShopifyModule,
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
  ],
  controllers: [ListingsController],
})
export class ListingsModule {}
