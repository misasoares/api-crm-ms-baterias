import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    let customerId = createOrderDto.customerId;

    if (!customerId) {
      if (!createOrderDto.customerName || !createOrderDto.customerPhone) {
        throw new Error('Customer name and phone are required when customerId is not provided');
      }

      // Check if customer exists by phone to avoid unique constraint error
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { phone: createOrderDto.customerPhone },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
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

    return this.prisma.order.create({
      data: {
        type: createOrderDto.type,
        vehicle: createOrderDto.vehicle,
        product: createOrderDto.product,
        customerId: customerId!,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }
}
