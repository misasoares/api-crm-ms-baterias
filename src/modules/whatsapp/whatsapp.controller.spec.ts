import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappService } from './whatsapp.service.js';
import { jest } from '@jest/globals';

describe('WhatsappController', () => {
  let controller: WhatsappController;
  // let service: WhatsappService;

  const mockWhatsappService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
    // service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message', async () => {
      const dto = { phone: '123', message: 'Hello' };
      const response = { success: true };
      (mockWhatsappService.sendMessage as jest.Mock<any>).mockResolvedValue(
        response,
      );

      expect(await controller.sendMessage(dto)).toBe(response);
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledWith(dto.phone);
    });
  });
});
