import { Controller, Post, Body, Get } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  async getStatus() {
    return this.whatsappService.getConnectionStatus();
  }

  @Get('qr')
  async getQrCode() {
    return this.whatsappService.getQrCode();
  }

  @Post('send')
  sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.whatsappService.sendMessage(sendMessageDto.phone, sendMessageDto.text);
  }
}
