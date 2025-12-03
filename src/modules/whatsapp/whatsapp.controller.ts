import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.whatsappService.sendMessage(sendMessageDto.phone);
  }
}
