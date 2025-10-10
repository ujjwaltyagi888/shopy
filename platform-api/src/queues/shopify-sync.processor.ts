import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ShopifyService } from '../shopify/shopify.service';
import { AppDataSource } from '../db/typeorm.config';
import { Product } from '../entities/product.entity';
import { MerchantListing } from '../entities/merchant-listing.entity';
import { Logger } from '@nestjs/common';

@Processor('shopify-sync')
export class ShopifySyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ShopifySyncProcessor.name);

  constructor(private readonly shopifyService: ShopifyService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} for product ${job.data.productId}`);
    try {
      const { productId, merchantId, retailPricePaise } = job.data;

      const product = await AppDataSource.getRepository(Product).findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new Error('Product not found');
      }

      this.logger.log(`Found product: ${product.title}`);

      const shopifyProduct = await this.shopifyService.createProduct(
        product,
        retailPricePaise,
      );

      product.shopify_product_id = shopifyProduct.id;
      await AppDataSource.getRepository(Product).save(product);

      const listing = await AppDataSource.getRepository(
        MerchantListing,
      ).findOne({
        where: { product: { id: productId }, merchant: { id: merchantId } },
      });

      if (listing) {
        listing.shopify_product_id = shopifyProduct.id;
        if (
          shopifyProduct.variants &&
          shopifyProduct.variants.edges &&
          shopifyProduct.variants.edges.length > 0
        ) {
          listing.shopify_variant_id = shopifyProduct.variants.edges[0].node.id;
        } else {
          this.logger.warn(
            `Shopify product ${shopifyProduct.id} created without variants.`,
          );
        }
        await AppDataSource.getRepository(MerchantListing).save(listing);
        this.logger.log(
          `Successfully synced product ${product.id} to Shopify product ${shopifyProduct.id}`,
        );
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  }
}
