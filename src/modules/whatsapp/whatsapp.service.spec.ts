import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service.js';
import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn() as any;

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(async () => {
     // Mock env vars
     process.env.STEVO_API_URL = 'http://api.test';
     process.env.STEVO_API_TOKEN = 'token';
     process.env.STEVO_INSTANCE_ID = 'instance';

    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappService],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if config is missing', async () => {
      delete process.env.STEVO_API_URL;
      // We need to re-instantiate, so configure testing module again
       const moduleBuilder = Test.createTestingModule({
        providers: [WhatsappService],
      });

      try {
        await moduleBuilder.compile();
      } catch (e) {
          // NestJS container might wrap error or it might happen on instantiation
      }
      // Actually WhatsappService probably checks in constructor.
      // NestJS instantiates interactively.
      
      // Let's manually check instantiation as Nest catches startup errors
      expect(() => new WhatsappService()).toThrow();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        success: true,
        data: { Id: 'msg-id', Details: 'Sent', Timestamp: 123 },
        code: 200,
      };

      (global.fetch as jest.Mock<any>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse as never),
      });

      const result = await service.sendMessage('123456789', 'Hello');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.test/chat/send/text',
        expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
                token: 'token'
            })
        })
      );
    });

    it('should throw InternalServerErrorException if API returns non-ok status', async () => {
      (global.fetch as jest.Mock<any>).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Error' as never),
      });

      await expect(service.sendMessage('123')).rejects.toThrow('Failed to send WhatsApp message');
    });

     it('should throw InternalServerErrorException on network failure', async () => {
      (global.fetch as jest.Mock<any>).mockRejectedValue(new Error('Network Error'));

      await expect(service.sendMessage('123')).rejects.toThrow('Failed to send WhatsApp message');
    });
  });
});
