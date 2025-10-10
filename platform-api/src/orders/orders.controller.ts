import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { AppDataSource } from '../db/typeorm.config';
import { Order } from '../entities/order.entity';
import { In, IsNull, Not } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { Merchant } from '../entities/merchant.entity';
import { Response } from 'express';

@Controller('orders')
export class OrdersController {
  private cfg = new ConfigService();

  @Get()
  async getOrders(@Query('status') status?: string) {
    const merchant = await this.getCurrentMerchant();
    if (!merchant) return [];
    let where: any = { merchant: { id: merchant.id } };
    if (status && status !== 'all') {
      where = { ...where, status };
    }
    return AppDataSource.getRepository(Order).find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  @Post(':id/note')
  async addNote(@Param('id') id: string, @Body() body: { note: string }) {
    return AppDataSource.getRepository(Order).update(id, { notes: body.note });
  }

  @Post(':id/tag')
  async addTag(@Param('id') id: string, @Body() body: { tag: string }) {
    const order = await AppDataSource.getRepository(Order).findOne({
      where: { id },
    });
    if (!order) throw new Error('Order not found');
    const tags = order.tags || [];
    if (!tags.includes(body.tag)) {
      tags.push(body.tag);
    }
    return AppDataSource.getRepository(Order).update(id, { tags });
  }

  @Post('export')
  async exportCsv(@Res() res: Response) {
    const merchant = await this.getCurrentMerchant();
    if (!merchant) return res.status(404).send('Merchant not found');

    const orders = await AppDataSource.getRepository(Order).find({
      where: { merchant: { id: merchant.id } },
      order: { created_at: 'DESC' },
    });

    const header =
      'shopify_order_number,date,customer_name,customer_email,customer_phone,total,status,tags,notes\n';
    const rows = orders.map((o) =>
      [
        o.shopify_order_number,
        o.created_at.toISOString(),
        o.customer?.name,
        o.customer?.email,
        o.customer?.phone,
        (o.total_paise || 0) / 100,
        o.status,
        (o.tags || []).join(','),
        (o.notes || '').replace(/\n/g, ' '),
      ]
        .map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`)
        .join(','),
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send([header, ...rows].join('\n'));
  }

  private async getCurrentMerchant() {
    if (!this.cfg.merchantDomain) return null;
    return AppDataSource.getRepository(Merchant).findOne({
      where: { shopDomain: this.cfg.merchantDomain },
    });
  }
}
