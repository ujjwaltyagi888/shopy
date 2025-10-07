// empty

import { IdempotencyService } from "src/common/idempotency.service";
import { AppDataSource } from "src/db/typeorm.config";
import { IdempotencyKey } from "src/entities/idempotency-key.entity";
import { Merchant } from "src/entities/merchant.entity";
import { createShipmentQueue } from "src/queues/bullmq.provider";


export class WebhooksService{
    async handleOrdersCreate(raw: Buffer , topic: string, wid: string){
        const idempotencyKey = `${topic}:${wid}`;
        if(await IdempotencyService.has(idempotencyKey)) return ;
        
        const payload = JSON.parse(raw.toString());
        const shopDomain = payload?.domain || payload?.domain_name || payload?.myshopify_domain;
        const merchant = await AppDataSource.getRepository(Merchant).findOne({where: {shop_domain:shopDomain}})
        if(!merchant) throw new Error('Unknown merchant domain');
        
        const orderRepo = AppDataSource.getRepository(Order);
        const itemRepo = AppDataSource.getRepository(OrderItem);
        const order = orderRepo.create({
            merchant:merchant,
            shopify_order_id : String(payload.id),
            shppify_order_number : String(payload.order_number ?? ' '),
            customer: {name: payload.customer?.first_name + ' '+payload.customer?.phone,email:payload.email },
            shipping_address : payload.shipping_address,
            billing_address: payload.billing_address,
            cod: payload.gateway?.toLowerCase()?.includes('cod') || false,
            total_paise: Math.round(Number(payload.total_price ?? 0) * 100),
            status: 'created'
        });

        await orderRepo.save(order);
        
        for(const li of payload.line_items ?? []){
            await itemRepo.save(itemRepo.create({
                order:order,
                product_id: undefined as any,
                quantity: li.quantity,
                unit_price_paise: Math.round(Number(li.price ? )*100)
            }));
        }
        
        await IdempotencyService.add(idempotencyKey);
        await createShipmentQueue.add('create',{orderId: order.id})
    }
}