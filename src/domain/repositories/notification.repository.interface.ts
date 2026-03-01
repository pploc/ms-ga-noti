import type { Notification, NotificationStatus } from '../entities/notification.entity';

export interface NotificationFilter {
  customerId?: string;
  status?: NotificationStatus;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  find(filter: NotificationFilter): Promise<{ notifications: Notification[]; total: number }>;
  create(notification: Partial<Notification>): Promise<Notification>;
  updateStatus(
    id: string,
    status: NotificationStatus,
    data?: Partial<
      Pick<Notification, 'sentAt' | 'deliveredAt' | 'readAt' | 'failureReason' | 'retryCount'>
    >,
  ): Promise<Notification | null>;
}
