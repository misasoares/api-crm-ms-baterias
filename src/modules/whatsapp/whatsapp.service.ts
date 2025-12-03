import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class WhatsappService {
  private readonly apiUrl = process.env.STEVO_API_URL;
  private readonly apiToken = process.env.STEVO_API_TOKEN;
  private readonly instanceId = process.env.STEVO_INSTANCE_ID;

  constructor() {
    if (!this.apiToken) {
      throw new Error(
        'STEVO_API_TOKEN is not defined in environment variables',
      );
    }
    if (!this.apiUrl) {
      throw new Error('STEVO_API_URL is not defined in environment variables');
    }
    if (!this.instanceId) {
      throw new Error(
        'STEVO_INSTANCE_ID is not defined in environment variables',
      );
    }
  }

  async sendMessage(phone: string) {
    const endpoint = `${this.apiUrl}/chat/send/text`;

    const payload = {
      Phone: phone,
      Body: 'teste automação misa',
      Id: randomUUID(),
    };

    const headers = {
      'Content-Type': 'application/json',
      token: this.apiToken as string,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`External API error: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as {
        code: number;
        data: {
          Details: string;
          Id: string;
          Timestamp: number;
        };
        success: boolean;
      };
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }
}
