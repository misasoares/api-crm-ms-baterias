import { PrismaClient, Customer } from '@prisma/client';

export class CustomerBuilder {
  private data: Partial<Customer> = {
    name: 'Test Customer',
    phone: '1234567890',
  };

  withName(name: string): CustomerBuilder {
    this.data.name = name;
    return this;
  }

  withPhone(phone: string): CustomerBuilder {
    this.data.phone = phone;
    return this;
  }

  async build(prisma: PrismaClient): Promise<Customer> {
    return prisma.customer.create({
      data: this.data as Customer,
    });
  }
}
