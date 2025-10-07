// empty
// Usage: node tools/test-shopify-hmac.js http://localhost:4000/webhooks/shopify/orders-create shpss_secret
const [,, url, secret] = process.argv;
if (!url || !secret) {
console.error('Usage: node tools/test-shopify-hmac.js <url> <webhook_secret>');
process.exit(1);
}
const crypto = require('crypto');
const https = require('https');
const http = require('http');


const payload = {
id: 1234567890,
order_number: 1010,
email: 'buyer@example.com',
customer: { first_name: 'Asha', last_name: 'Verma', phone: '+91-9999999999' },
shipping_address: { city: 'Mumbai', country: 'IN' },
billing_address: { city: 'Mumbai', country: 'IN' },
total_price: '499.00',
gateway: 'prepaid',
line_items: [{ title: 'Sample', quantity: 1, price: '499.00' }],
domain: 'your-merchant.myshopify.com'
};


const body = Buffer.from(JSON.stringify(payload));
const hmac = crypto.createHmac('sha256', secret).update(body).digest('base64');


const client = url.startsWith('https') ? https : http;
const req = client.request(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Content-Length': body.length,
'X-Shopify-Hmac-Sha256': hmac,
'X-Shopify-Topic': 'orders/create',
'X-Shopify-Webhook-Id': 'test-wid-1',
'X-Shopify-Shop-Domain': 'your-merchant.myshopify.com'
}
}, res => {
console.log('Status:', res.statusCode);
res.setEncoding('utf8');
res.on('data', d => process.stdout.write(d));
});
req.on('error', console.error);
req.write(body);
req.end();
