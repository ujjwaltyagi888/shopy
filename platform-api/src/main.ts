// empty

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { AppDataSource } from './db/typeorm.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const cfg = new ConfigService();
    await AppDataSource.initialize();
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        rawBody: true,
    });
    
    await app.listen(cfg.port);
    console.log(`API listening on : ${cfg.port}`);
}
bootstrap();
