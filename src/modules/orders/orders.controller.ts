import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiCreatedResponse({ type: OrderEntity })
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    return new OrderEntity(order);
  }

  @Get()
  @ApiOkResponse({ type: OrderEntity, isArray: true })
  async findAll() {
    const orders = await this.ordersService.findAll();
    return orders.map((order) => new OrderEntity(order));
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderEntity })
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return new OrderEntity(order);
  }
}
