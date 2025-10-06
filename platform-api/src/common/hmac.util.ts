// empty
import crypto from 'crypto'

export function verifyShopifyHmac(rawBody: Buffer, secret: string ,hmacHeader? : string) :boolean {
    if(!hmacHeader) return false;
    const digest = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('base64');

        return crypto.timingSafeEqual(Buffer.from(digest),Buffer.from(hmacHeader));

}