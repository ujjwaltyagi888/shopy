// empty
import crypto from 'crypto'

export function verifyShopifyHmac(rawBody: Buffer, secret: string, hmacHeader?: string): boolean {
    if (!secret || !hmacHeader) return false;
    const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    const a = Buffer.from(digest, 'utf8');
    const b = Buffer.from(hmacHeader, 'utf8');
    if (a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
