import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OilRemindersService } from './oil-reminders.service.js';

@ApiTags('oil-reminders')
@Controller('oil-reminders')
export class OilRemindersController {
  constructor(private oilRemindersService: OilRemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os lembretes' })
  async findAll() {
    return this.oilRemindersService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de lembretes' })
  async getStats() {
    return this.oilRemindersService.getStats();
  }
}
