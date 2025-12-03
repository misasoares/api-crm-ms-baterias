import { ApiProperty } from '@nestjs/swagger';
import { OilChangeReminder, ReminderStatus } from '@prisma/client';

export class OilReminderEntity implements OilChangeReminder {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  scheduledFor: Date;

  @ApiProperty({ enum: ReminderStatus })
  status: ReminderStatus;

  @ApiProperty({ required: false })
  sentAt: Date | null;

  @ApiProperty({ required: false })
  messageId: string | null;

  @ApiProperty({ required: false })
  cancelledAt: Date | null;

  @ApiProperty()
  attempts: number;

  @ApiProperty({ required: false })
  lastAttemptAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<OilReminderEntity>) {
    Object.assign(this, partial);
  }
}
