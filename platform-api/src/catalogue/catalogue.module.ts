import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';

@Module({
  controllers: [CatalogueController],
})
export class CatalogueModule {}
