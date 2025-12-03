import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OilRemindersService } from '../oil-reminders/oil-reminders.service.js';
import { OrderType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oilRemindersService: OilRemindersService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    let customerId = createOrderDto.customerId;

    if (!customerId) {
      if (!createOrderDto.customerName || !createOrderDto.customerPhone) {
        throw new Error(
          'Customer name and phone are required when customerId is not provided',
        );
      }

      // Check if customer exists by phone to avoid unique constraint error
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { phone: createOrderDto.customerPhone },
      });

      if (existingCustomer) {
        throw new ConflictException(
          'Este número de telefone já está vinculado a outro cliente.',
        );
      } else {
        const newCustomer = await this.prisma.customer.create({
          data: {
            name: createOrderDto.customerName,
            phone: createOrderDto.customerPhone,
          },
        });
        customerId = newCustomer.id;
      }
    }

    const order = await this.prisma.order.create({
      data: {
        type: createOrderDto.type,
        vehicle: createOrderDto.vehicle,
        product: createOrderDto.product,
        customerId: customerId,
      },
    });

    // Se for pedido OIL, gerenciar lembretes
    if (order.type === OrderType.OIL) {
      // Cancelar lembretes pendentes do cliente
      await this.oilRemindersService.cancelPendingReminders(order.customerId);

      // Criar novo lembrete
      await this.oilRemindersService.createReminderForOrder(order.id);
    }

    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
