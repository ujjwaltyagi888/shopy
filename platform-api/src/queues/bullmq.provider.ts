// empty


import { Queue, QueueEvents , Worker} from 'bullmq';
import IORedis from 'ioredis';
import { ConfigService } from '../config/config.service';




const cfg = new ConfigService();
export const redis = new IORedis(cfg.redisUrl, {
  maxRetriesPerRequest: null
});
export const createShipmentQueue = new Queue('create-shipment',{connection: redis});
export const createShipmentEvents = new QueueEvents('create-shipment',{connection:redis});
