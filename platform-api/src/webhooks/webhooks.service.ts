import { IdempotencyService } from "../common/idempotency.service";
import { AppDataSource } from "../db/typeorm.config";
import { Merchant } from "../entities/merchant.entity";
import { createShipmentQueue } from "../queues/bullmq.provider";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Product } from "../entities/product.entity";


export class WebhooksService {
    async handleOrdersCreate(raw: Buffer, topic: string, wid: string, shopDomain: string) {
        const idempotencyKey = `${topic}:${wid}`;
        if (await IdempotencyService.has(idempotencyKey)) return;

        const merchant = await AppDataSource.getRepository(Merchant).findOne({ where: { shopDomain } });
        if (!merchant) throw new Error(`Unknown merchant domain: ${shopDomain}`);
        const payload = JSON.parse(raw.toString());

        const orderRepo = AppDataSource.getRepository(Order);
        const itemRepo = AppDataSource.getRepository(OrderItem);
        const productRepo = AppDataSource.getRepository(Product);

        const order = orderRepo.create({
            merchant: merchant,
            shopify_order_id: String(payload.id),
            shopify_order_number: String(payload.order_number ?? ' '),
            customer: { name: payload.customer?.first_name + ' ' + payload.customer?.phone, email: payload.email },
            shipping_address: payload.shipping_address,
            billing_address: payload.billing_address,
            cod: payload.gateway?.toLowerCase()?.includes('cod') || false,
            total_paise: Math.round(Number(payload.total_price ?? 0) * 100),
            status: 'created'
        });

        await orderRepo.save(order);

        for (const li of payload.line_items ?? []) {
            const prod = await productRepo.findOne({ where: { sku: li.sku } });
            await itemRepo.save(itemRepo.create({
                order: order,
                product: prod || ({ id: null } as any),
                quantity: li.quantity,
                unit_price_paise: Math.round(Number(li.price ?? 0) * 100)
            }));
        }

        await IdempotencyService.add(idempotencyKey);
        try {
            await createShipmentQueue.add('create-shipment-job', { orderId: order.id });
        } catch (err) {
            console.error('queue add failed:', err);
            throw new Error(`queue add failed: ${(err as Error)?.message ?? 'unknown error'}`);
        }
    }
}
