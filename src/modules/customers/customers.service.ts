import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  findAll(search?: string) {
    if (search) {
      return this.prisma.customer.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });
    }
    return this.prisma.customer.findMany();
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }
}
