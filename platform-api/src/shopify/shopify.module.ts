import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
