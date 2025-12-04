import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { IsPublic } from './common/decorators/is-public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @IsPublic()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
