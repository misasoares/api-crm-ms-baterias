import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Query,
  Patch,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CustomerEntity } from './entities/customer.entity.js';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiCreatedResponse({ type: CustomerEntity })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    return {
      message: 'Cliente criado com sucesso',
      data: new CustomerEntity(customer),
    };
  }

  @Get()
  @ApiOkResponse({ type: CustomerEntity, isArray: true })
  async findAll(@Query('search') search?: string) {
    const customers = await this.customersService.findAll(search);
    return customers.map((customer) => new CustomerEntity(customer));
  }

  @Get(':id')
  @ApiOkResponse({ type: CustomerEntity })
  async findOne(@Param('id') id: string) {
    const customer = await this.customersService.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return new CustomerEntity(customer);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CustomerEntity })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update(id, updateCustomerDto);
    return {
      message: 'Cliente atualizado com sucesso',
      data: new CustomerEntity(customer),
    };
  }
}
