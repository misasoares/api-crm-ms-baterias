import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderType } from '@prisma/client';

export class OrderEntity implements Order {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty()
  vehicle: string;

  @ApiProperty()
  product: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
