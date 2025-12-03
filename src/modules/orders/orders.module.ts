import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { OilRemindersModule } from '../oil-reminders/oil-reminders.module.js';

@Module({
  imports: [OilRemindersModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
