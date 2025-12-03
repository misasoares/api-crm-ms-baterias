import { Controller, Get, Post, Body, Param, NotFoundException, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CustomerEntity } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiCreatedResponse({ type: CustomerEntity })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    return new CustomerEntity(customer);
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
}
