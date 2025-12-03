import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OilRemindersService } from './oil-reminders.service.js';
import { WhatsappService } from '../whatsapp/whatsapp.service.js';

@Injectable()
export class OilRemindersCronService {
  private readonly logger = new Logger(OilRemindersCronService.name);

  constructor(
    private oilRemindersService: OilRemindersService,
    private whatsappService: WhatsappService,
  ) {}

  // Executar todos os dias às 9h, de segunda a sexta
  @Cron('0 9 * * 1-5', {
    timeZone: 'America/Sao_Paulo',
  })
  async processPendingReminders() {
    this.logger.log('Iniciando processamento de lembretes pendentes...');

    try {
      const reminders = await this.oilRemindersService.getPendingReminders();

      this.logger.log(
        `Encontrados ${reminders.length} lembretes para processar`,
      );

      for (const reminder of reminders) {
        try {
          await this.oilRemindersService.processReminder(
            reminder.id,
            this.whatsappService,
          );
          this.logger.log(`Lembrete ${reminder.id} processado com sucesso`);
        } catch (error) {
          this.logger.error(
            `Erro ao processar lembrete ${reminder.id}:`,
            error,
          );
        }
      }

      this.logger.log('Processamento concluído');
    } catch (error) {
      this.logger.error('Erro no processamento de lembretes:', error);
    }
  }
}
