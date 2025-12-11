import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ example: 'Toyota Corolla' })
  @IsString()
  @IsNotEmpty()
  vehicle: string;

  @ApiProperty({ example: 'Bateria Moura 60Ah' })
  @IsString()
  @IsNotEmpty()
  product: string;
}
