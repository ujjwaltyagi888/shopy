// empty

import { Controller, HttpStatus, Post, Res,Req } from "@nestjs/common";
import { verifyShopifyHmac } from "../common/hmac.util";
import { ConfigService } from "../config/config.service";
import { WebhooksService } from "./webhooks.service";


@Controller('webhooks/shopify')
export class WebhooksController{
    private cfg = new ConfigService();
    constructor(private readonly svc: WebhooksService) {}

    @Post('orders-create')
    async ordersCreate(@Req() req: any, @Res() res: any) {
        console.log('orders-create: received');
        const raw = req.rawBody;
        const hmac = req.headers['x-shopify-hmac-sha256'] as string | undefined;
        const ok = verifyShopifyHmac(raw, this.cfg.shopifyWebhookSecret, hmac);
        if (!ok) return res.status(HttpStatus.UNAUTHORIZED).send('Invalid HMAC');
        console.log('orders-create: hmac ok');

        const topic = req.headers['x-shopify-topic'];
        const wid = req.headers['x-shopify-webhook-id'];
        const shopDomainHeader = req.headers['x-shopify-shop-domain'] as string | undefined;
        const payload = JSON.parse(raw.toString());
        const shopDomain = shopDomainHeader ?? payload?.domain ?? payload?.domain_name ?? payload?.myshopify_domain;
        console.log('orders-create: shopDomain=', shopDomain);

        try {
            console.log('orders-create: before service call');
            await this.svc.handleOrdersCreate(raw, String(topic), String(wid), shopDomain);
            console.log('orders-create: after service call');
            return res.status(200).send('ok');
        } catch (e) {
            console.error('orders-create failed:', e);
            const message = (e as Error)?.message ?? 'Internal server error';
            return res.status(500).json({ message });
        }
    }

}
