import { PrismaClient, Order, OrderType } from '@prisma/client';

export class OrderBuilder {
  private data: Partial<Order> = {
    type: OrderType.BATTERY,
    vehicle: 'Test Vehicle',
    product: 'Test Product',
  };
  private customerId: string | undefined;

  withType(type: OrderType): OrderBuilder {
    this.data.type = type;
    return this;
  }

  withVehicle(vehicle: string): OrderBuilder {
    this.data.vehicle = vehicle;
    return this;
  }

  withProduct(product: string): OrderBuilder {
    this.data.product = product;
    return this;
  }

  withCustomerId(customerId: string): OrderBuilder {
    this.customerId = customerId;
    return this;
  }

  async build(prisma: PrismaClient): Promise<Order> {
    if (!this.customerId) {
      throw new Error('Customer ID is required to create an order');
    }
    return prisma.order.create({
      data: {
        ...this.data,
        customerId: this.customerId,
      } as Order,
    });
  }
}
