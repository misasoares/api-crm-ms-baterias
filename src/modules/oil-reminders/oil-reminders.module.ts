import { Module } from '@nestjs/common';
import { OilRemindersService } from './oil-reminders.service.js';
import { OilRemindersController } from './oil-reminders.controller.js';
import { OilRemindersCronService } from './oil-reminders.cron.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule],
  controllers: [OilRemindersController],
  providers: [OilRemindersService, OilRemindersCronService],
  exports: [OilRemindersService],
})
export class OilRemindersModule {}
