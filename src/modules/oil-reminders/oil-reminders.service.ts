import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OilChangeReminder, ReminderStatus } from '@prisma/client';
import { WhatsappService } from '../whatsapp/whatsapp.service.js';

@Injectable()
export class OilRemindersService {
  private readonly logger = new Logger(OilRemindersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria um lembrete para um pedido de troca de óleo
   */
  async createReminderForOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Calcular data agendada (6 meses + ajuste para dia útil)
    const scheduledDate = this.calculateScheduledDate(order.createdAt);

    await this.prisma.oilChangeReminder.create({
      data: {
        orderId: order.id,
        scheduledFor: scheduledDate,
        status: ReminderStatus.PENDING,
        attempts: 0,
      },
    });

    this.logger.log(
      `Reminder created for order ${orderId}, scheduled for ${scheduledDate.toISOString()}`,
    );
  }

  /**
   * Calcula a data agendada (6 meses + ajuste para dia útil)
   */
  private calculateScheduledDate(orderDate: Date): Date {
    const date = new Date(orderDate);

    // Em desenvolvimento: agendar para 2 minutos depois
    if (process.env.NODE_ENV === 'development') {
      date.setMinutes(date.getMinutes() + 2);
      return date;
    }

    // Adicionar 6 meses
    date.setMonth(date.getMonth() + 6);

    // Ajustar para dia útil se cair em fim de semana
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      // Domingo
      date.setDate(date.getDate() + 1); // Segunda
    } else if (dayOfWeek === 6) {
      // Sábado
      date.setDate(date.getDate() + 2); // Segunda
    }

    // Definir horário para 9h
    date.setHours(9, 0, 0, 0);

    return date;
  }

  /**
   * Cancela lembretes pendentes de um cliente
   */
  async cancelPendingReminders(customerId: string): Promise<void> {
    const result = await this.prisma.oilChangeReminder.updateMany({
      where: {
        order: {
          customerId: customerId,
          type: 'OIL',
        },
        status: ReminderStatus.PENDING,
      },
      data: {
        status: ReminderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Cancelled ${result.count} pending reminders for customer ${customerId}`,
      );
    }
  }

  /**
   * Busca lembretes pendentes prontos para envio
   */
  async getPendingReminders(): Promise<OilChangeReminder[]> {
    const now = new Date();

    return this.prisma.oilChangeReminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        scheduledFor: { lte: now },
        attempts: { lt: 3 }, // Menos de 3 tentativas
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  /**
   * Processa um lembrete (envia mensagem)
   */
  async processReminder(
    reminderId: string,
    whatsappService: WhatsappService,
  ): Promise<void> {
    const reminder = await this.prisma.oilChangeReminder.findUnique({
      where: { id: reminderId },
      include: {
        order: {
          include: { customer: true },
        },
      },
    });

    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    try {
      // Enviar mensagem WhatsApp
      const message = this.getMessageTemplate(
        reminder.order.customer.name,
        reminder.order.vehicle,
      );

      const response = (await whatsappService.sendMessage(
        reminder.order.customer.phone,
        message,
      )) as {
        code: number;
        data: {
          Details: string;
          Id: string;
          Timestamp: number;
        };
        success: boolean;
      };

      // Sucesso
      await this.markAsSent(reminder.id, response.data.Id);
      this.logger.log(`Reminder ${reminderId} sent successfully`);
    } catch (error) {
      // Incrementar tentativas
      const newAttempts = reminder.attempts + 1;

      if (newAttempts >= 3) {
        // Falhou após 3 tentativas
        await this.markAsFailed(reminder.id);
        this.logger.error(
          `Reminder ${reminderId} failed after 3 attempts`,
          error,
        );
      } else {
        // Atualizar para tentar novamente amanhã
        await this.prisma.oilChangeReminder.update({
          where: { id: reminder.id },
          data: {
            attempts: newAttempts,
            lastAttemptAt: new Date(),
          },
        });
        this.logger.warn(
          `Reminder ${reminderId} failed, attempt ${newAttempts}/3`,
        );
      }

      throw error;
    }
  }

  /**
   * Marca lembrete como enviado
   */
  async markAsSent(reminderId: string, messageId: string): Promise<void> {
    await this.prisma.oilChangeReminder.update({
      where: { id: reminderId },
      data: {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
        messageId: messageId,
      },
    });
  }

  /**
   * Marca lembrete como falho
   */
  async markAsFailed(reminderId: string): Promise<void> {
    await this.prisma.oilChangeReminder.update({
      where: { id: reminderId },
      data: {
        status: ReminderStatus.FAILED,
        lastAttemptAt: new Date(),
      },
    });
  }

  /**
   * Template de mensagem
   */
  private getMessageTemplate(customerName: string, vehicle: string): string {
    return `Olá ${customerName}! 👋

Já fazem 6 meses desde a última troca de óleo do seu *${vehicle}*.

É importante manter a manutenção em dia para garantir o melhor desempenho e durabilidade do seu veículo! 🚗

Gostaria de agendar uma nova troca de óleo? Entre em contato conosco!`;
  }

  /**
   * Lista todos os lembretes
   */
  async findAll(): Promise<OilChangeReminder[]> {
    return this.prisma.oilChangeReminder.findMany({
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Estatísticas de lembretes
   */
  async getStats() {
    const [total, pending, sent, cancelled, failed] = await Promise.all([
      this.prisma.oilChangeReminder.count(),
      this.prisma.oilChangeReminder.count({
        where: { status: ReminderStatus.PENDING },
      }),
      this.prisma.oilChangeReminder.count({
        where: { status: ReminderStatus.SENT },
      }),
      this.prisma.oilChangeReminder.count({
        where: { status: ReminderStatus.CANCELLED },
      }),
      this.prisma.oilChangeReminder.count({
        where: { status: ReminderStatus.FAILED },
      }),
    ]);

    return {
      total,
      pending,
      sent,
      cancelled,
      failed,
    };
  }
}
