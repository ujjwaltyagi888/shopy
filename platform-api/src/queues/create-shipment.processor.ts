import { AppDataSource } from '../db/typeorm.config';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryReservation } from '../entities/inventory-reservation.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Worker } from 'bullmq';
import { redis } from './bullmq.provider';


async function reserveStockForOrder(orderId: string) {
return AppDataSource.transaction(async (trx) => {
const orderRepo = trx.getRepository(Order);
const prodRepo = trx.getRepository(Product);
const invRepo = trx.getRepository(Inventory);
const resRepo = trx.getRepository(InventoryReservation);
const movRepo = trx.getRepository(InventoryMovement);
const whRepo = trx.getRepository(Warehouse);


const order = await orderRepo.findOne({ where: { id: orderId }, relations: { } });
if (!order) throw new Error('Order not found');


// For MVP: single MAIN warehouse
const mainWh = await whRepo.findOne({ where: { code: 'MAIN' } });


// Fetch order items raw (join not shown here for brevity)
const items = await trx.query(`SELECT oi.quantity, p.id as product_id, p.sku
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = $1`, [orderId]);


for (const it of items) {
// Lock inventory row
const rows = await trx.query(
`SELECT id, quantity FROM inventory
WHERE product_id = $1 AND warehouse_id = $2
FOR UPDATE`,
[it.product_id, mainWh?.id]
);
if (!rows.length || rows[0].quantity < it.quantity) {
await orderRepo.update(orderId, { status: 'backorder' });
throw new Error(`INSUFFICIENT_STOCK_${it.product_id}`);
}
// decrement
await trx.query(`UPDATE inventory SET quantity = quantity - $1, updated_at = now() WHERE id = $2`, [it.quantity, rows[0].id]);
// ledger + reservation
await resRepo.save(resRepo.create({ product: { id: it.product_id } as any, order: { id: orderId } as any, warehouse: mainWh!, quantity: it.quantity, status: 'open' }));
await movRepo.save(movRepo.create({ product: { id: it.product_id } as any, warehouse: mainWh!, change: -it.quantity, reason: 'reservation', ref_type: 'order', ref_id: orderId }));
}


await orderRepo.update(orderId, { status: 'label_pending' });
});
}


export const createShipmentWorker = new Worker(
'create-shipment',
async job => {
const { orderId } = job.data as { orderId: string };
try {
await reserveStockForOrder(orderId);
// TODO (Week 2): call 3PL to create shipment; on success → mark reservations as consumed + add movement(reason='shipment')
console.log('Reserved and ready to create label for order', orderId);
} catch (e) {
console.error('Shipment prep failed', orderId, e);
}
},
{ connection: redis, concurrency: 5 }
);
