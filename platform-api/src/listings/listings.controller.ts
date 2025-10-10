import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppDataSource } from '../db/typeorm.config';
import { MerchantListing } from '../entities/merchant-listing.entity';
import { Product } from '../entities/product.entity';
import { Merchant } from '../entities/merchant.entity';
import { ConfigService } from '../config/config.service';
import { Queue } from 'bullmq';

@Controller('listings')
export class ListingsController {
  private readonly logger = new Logger(ListingsController.name);
  private cfg = new ConfigService();

  constructor(
    @InjectQueue('shopify-sync') private readonly shopifySyncQueue: Queue,
  ) {}

  @Get()
  async getListings() {
    const merchant = await this.getCurrentMerchant();
    if (!merchant) return [];
    return AppDataSource.getRepository(MerchantListing).find({
      where: { merchant: { id: merchant.id } },
    });
  }

  @Post()
  async createOrUpdateListing(
    @Body() body: { productId: string; retailPricePaise: number },
  ) {
    const merchant = await this.getCurrentMerchant();
    if (!merchant) throw new Error('Merchant not found');

    this.logger.log(`Creating or updating listing for product: ${body.productId}`);

    const product = await AppDataSource.getRepository(Product).findOne({
      where: { id: body.productId },
    });
    if (!product) throw new Error('Product not found');

    let listing = await AppDataSource.getRepository(MerchantListing).findOne({
      where: { product: { id: body.productId }, merchant: { id: merchant.id } },
    });

    if (listing) {
      listing.retail_price_paise = body.retailPricePaise;
    } else {
      listing = AppDataSource.getRepository(MerchantListing).create({
        merchant,
        product,
        retail_price_paise: body.retailPricePaise,
        status: 'active',
      });
    }

    const job = await this.shopifySyncQueue.add('sync-product', {
      productId: product.id,
      merchantId: merchant.id,
      retailPricePaise: body.retailPricePaise,
    });
    this.logger.log(`Added job ${job.id} to the shopify-sync queue.`);

    return AppDataSource.getRepository(MerchantListing).save(listing);
  }

  private async getCurrentMerchant() {
    if (!this.cfg.merchantDomain) return null;
    return AppDataSource.getRepository(Merchant).findOne({
      where: { shopDomain: this.cfg.merchantDomain },
    });
  }
}
