import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
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

  @ApiProperty({ example: '5551999999999', required: false })
  @Transform(({ value }: { value: string }) => value?.replace(/\D/g, ''))
  @IsString()
  @IsOptional()
  @Matches(/^55\d{11}$/, {
    message: 'Phone must be in format 55XXXXXXXXXXX (13 digits)',
  })
  customerPhone?: string;
}
