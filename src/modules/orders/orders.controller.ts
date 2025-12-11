import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
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
    return {
      message: 'Pedido criado com sucesso',
      data: new OrderEntity(order),
    };
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

  @Patch(':id')
  @ApiOkResponse({ type: OrderEntity })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.ordersService.update(id, updateOrderDto);
    return new OrderEntity(order);
  }
  @Delete(':id')
  @ApiOkResponse({ description: 'Order deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return {
      message: 'Pedido removido com sucesso',
    };
  }
}
