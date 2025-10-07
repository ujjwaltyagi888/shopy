// empty

import { Controller, HttpStatus, Post, Res,Req } from "@nestjs/common";
import { verifyShopifyHmac } from "src/common/hmac.util";
import { ConfigService } from "src/config/config.service";


@Controller('webhooks/shopify')
export class WebhooksController{
    private cfg = new ConfigService();
    constructor(private readonly svc: WebhooksService) {}

    @Post('orders-create')
    async ordersCreate( @Req() req:any , @Res res:any){
        const raw = req.rawBody as Buffer;
        const hmac = req.headers['x-shopify-hmac-sha256'] as string |undefined;
        const ok = verifyShopifyHmac(raw,this.cfg.shopifyWebhookSecret,hmac);
        if(!ok) return res.status(HttpStatus.UNAUTHORIZED).send('Invalid HMAC');

        const topic = req.headers['x-shopify-topic'];
        const wid = req.headers['x-shopify-webhook-id'];
        await this.svc.handleOrdersCreate(raw, String(topic), String(wid));
       
        return res.status(200).send('ok');
    }

}