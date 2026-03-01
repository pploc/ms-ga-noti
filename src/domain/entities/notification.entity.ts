import type { components } from '../types/api.generated';

export type NotificationStatus = components['schemas']['NotificationStatus'];
export type NotificationChannel = components['schemas']['NotificationChannel'];

export interface Notification {
  _id: string;
  customerId: string;
  templateId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject?: string;
  body: string;
  metadata: Record<string, unknown>;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
