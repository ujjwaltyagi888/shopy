import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Product } from '../entities/product.entity';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(private readonly configService: ConfigService) {}

  private getGraphQLEndpoint(): string {
    const storeDomain = this.configService.shopifyShopDomain;
    const apiVersion = this.configService.shopifyApiVersion;
    if (!storeDomain || !apiVersion) {
      throw new Error('Shopify domain or API version is not configured.');
    }
    return `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  }

  private async postToShopify(payload: { query: string; variables?: object }): Promise<any> {
    const endpoint = this.getGraphQLEndpoint();
    const accessToken = this.configService.shopifyAccessToken;

    if (!accessToken) {
      throw new Error('Shopify access token is not configured.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(`Shopify API request failed with status ${response.status}`);
      throw new Error(`Shopify API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async pingShop(): Promise<string> {
    this.logger.log('Pinging Shopify store to verify connection...');
    const body = await this.postToShopify({ query: `query { shop { name } }` });
    if (body.errors) {
      this.logger.error('Shopify ping failed with GraphQL errors:', body.errors);
      throw new Error('Shopify ping failed.');
    }
    const shopName = body.data.shop.name;
    this.logger.log(`Successfully connected to shop: ${shopName}`);
    return shopName;
  }

  async createProduct(product: Product, retailPricePaise: number): Promise<any> {
    this.logger.log(`Creating product in Shopify: ${product.title}`);
    await this.pingShop();

    const mutation = `#graphql
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`;

    const variables = {
      input: {
        title: product.title,
        descriptionHtml: product.description,
        status: product.active ? 'ACTIVE' : 'DRAFT',
        images: product.images?.map((img: any) => ({ src: img.src || img })),
      },
    };

    const body = await this.postToShopify({ query: mutation, variables });

    if (body.errors) {
      this.logger.error('GraphQL top-level errors:', body.errors);
      throw new Error('Shopify GraphQL returned errors');
    }

    if (!body.data || !body.data.productCreate) {
      this.logger.error('Unexpected GraphQL response shape:', body);
      throw new Error('Unexpected GraphQL response (no productCreate)');
    }

    const { productCreate } = body.data;

    if (productCreate.userErrors.length > 0) {
      this.logger.error(
        'Shopify API user errors:',
        productCreate.userErrors,
      );
      throw new Error('Failed to create product in Shopify due to user errors.');
    }

    const shopifyProduct = productCreate.product;
    this.logger.log(
      `Successfully created product in Shopify with ID: ${shopifyProduct.id}`,
    );
    return shopifyProduct;
  }
}
