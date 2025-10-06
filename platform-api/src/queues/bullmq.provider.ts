// empty


import { Queue, QueueEvents , Worker} from 'bullmq';
import IORedis from 'ioredis';
import { ConfigService } from 'src/config/config.service';




const cfg = new ConfigService();
export const redis = new IORedis(cfg.redisUrl);
export const createShipmentQueue = new Queue('create-shipment',{connection: redis});
export const createShipmentEvents = new QueueEvents('create-shipment',{connection:redis});


export const createShipmentWorker = new Worker(
    'create-shipment',
    async job => {
        const { orderId } = job.data as { orderId: string};
        console.log('CreateShipmentWorker processing order', orderId);

    },
    {connection: redis , concurrency: 5}
);

createShipmentWorker.onmessage('failed', (job,err) =>{
    console.error('CreateShipment failed', job?.id ,err);
});