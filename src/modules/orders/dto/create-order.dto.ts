import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';
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

  @ApiProperty({ example: 'uuid-of-customer', required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ example: '11999999999', required: false })
  @IsString()
  @IsOptional()
  customerPhone?: string;
}
