import type { components } from '../types/api.generated';

export type NotificationChannel = components['schemas']['NotificationChannel'];

export interface NotificationTemplate {
  _id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
