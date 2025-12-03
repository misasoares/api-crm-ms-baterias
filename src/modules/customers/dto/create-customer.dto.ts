import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '5551999999999' })
  @Transform(({ value }: { value: string }) => value.replace(/\D/g, ''))
  @IsString()
  @IsNotEmpty()
  @Matches(/^55\d{11}$/, {
    message: 'Phone must be in format 55XXXXXXXXXXX (13 digits)',
  })
  phone: string;
}
