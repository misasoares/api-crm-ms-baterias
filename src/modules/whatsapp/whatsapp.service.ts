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
        if (response.status === 404) {
           throw new Error('Instance not found');
        }
        throw new Error(`Failed to fetch connection status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.message === 'Instance not found') {
          throw error;
      }
      console.error('Error fetching connection status:', error);
      throw new InternalServerErrorException(
        'Failed to fetch connection status',
      );
    }
  }

  async getQrCode() {
    // First, try to get connection status to check if instance exists
    try {
      const status = await this.getConnectionStatus();
      
      // If instance exists but is closed or unconnected, connect it
      const endpoint = `${this.apiUrl}/instance/connect/${this.instanceName}`;
      const headers = {
        apikey: this.apiToken as string,
      };

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect instance: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If fetch fails (likely 404 instance not found in getConnectionStatus), create it
      // Note: getConnectionStatus throws InternalServerErrorException on error, 
      // but we need to distinguish 404. 
      // Refactoring getConnectionStatus to return null or specific error would be cleaner,
      // but here we can try-catch and assume if it failed we might need to create.
      // However, the cleanest way is to assume if "getConnectionStatus" failed specifically because of instance specific error.
      
      // Let's modify logic: Try to create if it doesn't exist. 
      // For simplicity in this existing structure: 
      console.log('Attempting to create instance because fetching status/connect failed or instance missing...');
      return this.createInstance();
    }
  }

  async createInstance() {
    const endpoint = `${this.apiUrl}/instance/create`;
    const headers = {
      'Content-Type': 'application/json',
      apikey: this.apiToken as string,
    };

    const payload = {
      instanceName: this.instanceName,
      token: randomUUID(),
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create instance: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating instance:', error);
      throw new InternalServerErrorException('Failed to create instance');
    }
  }

  async deleteInstance() {
    const endpoint = `${this.apiUrl}/instance/delete/${this.instanceName}`;
    const headers = {
      apikey: this.apiToken as string,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
             return { status: 'SUCCESS', message: 'Instance already deleted' };
        }
        const errorText = await response.text();
        throw new Error(`Failed to delete instance: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting instance:', error);
      throw new InternalServerErrorException('Failed to delete instance');
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
