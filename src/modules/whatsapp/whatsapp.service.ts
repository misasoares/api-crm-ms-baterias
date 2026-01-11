import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class WhatsappService {
  private readonly apiUrl = process.env.EVOLUTION_API_URL;
  private readonly apiToken = process.env.EVOLUTION_API_TOKEN;
  private readonly instanceName = process.env.EVOLUTION_INSTANCE_NAME;

  constructor() {
    if (!this.apiToken) {
      throw new Error(
        'EVOLUTION_API_TOKEN is not defined in environment variables',
      );
    }
    if (!this.apiUrl) {
      throw new Error(
        'EVOLUTION_API_URL is not defined in environment variables',
      );
    }
    if (!this.instanceName) {
      throw new Error(
        'EVOLUTION_INSTANCE_NAME is not defined in environment variables',
      );
    }
  }

  async getConnectionStatus() {
    const endpoint = `${this.apiUrl}/instance/connectionState/${this.instanceName}`;
    const headers = {
      apikey: this.apiToken as string,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connection status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching connection status:', error);
      throw new InternalServerErrorException(
        'Failed to fetch connection status',
      );
    }
  }

  async getQrCode() {
    const endpoint = `${this.apiUrl}/instance/connect/${this.instanceName}`;
    const headers = {
      apikey: this.apiToken as string,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw new InternalServerErrorException('Failed to fetch QR code');
    }
  }

  async sendMessage(phone: string, body?: string) {
    // Remove non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Evolution API endpoint: /message/sendText/{instance}
    const endpoint = `${this.apiUrl}/message/sendText/${this.instanceName}`;

    const payload = {
      number: cleanPhone,
      text: body || 'teste automação misa',
      delay: 1000,
      linkPreview: false,
    };

    const headers = {
      'Content-Type': 'application/json',
      apikey: this.apiToken as string,
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

      /*
       * Evolution API Response format for sendText:
       * {
       *   "key": {
       *     "remoteJid": "...",
       *     "fromMe": true,
       *     "id": "BAE5..." 
       *   },
       *   "message": { ... },
       *   "status": "PENDING"
       * }
       */
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }
}
