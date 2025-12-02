import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { OrderType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType, example: OrderType.BATTERY })
  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @ApiProperty({ example: 'Toyota Corolla' })
  @IsString()
  @IsNotEmpty()
  vehicle: string;

  @ApiProperty({ example: 'Bateria Moura 60Ah' })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ example: 'uuid-of-customer' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;
}
