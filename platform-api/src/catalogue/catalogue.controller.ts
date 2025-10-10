import { Controller, Get } from '@nestjs/common';
import { AppDataSource } from '../db/typeorm.config';
import { Product } from '../entities/product.entity';

@Controller('catalogue')
export class CatalogueController {
  @Get()
  async getCatalogue() {
    return AppDataSource.getRepository(Product).find({ where: { active: true } });
  }
}
