import { injectable } from 'inversify';
import {
  INotificationRepository,
  NotificationFilter,
} from '../../domain/repositories/notification.repository.interface';
import { Notification, NotificationStatus } from '../../domain/entities/notification.entity';
import { NotificationModel } from '../database/schemas/notification.schema';
import { FilterQuery } from 'mongoose';

@injectable()
export class NotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id).lean();
    return doc ? (doc as unknown as Notification) : null;
  }

  async find(
    filter: NotificationFilter,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const query: FilterQuery<unknown> = {};
    if (filter.customerId) query.customerId = filter.customerId;
    if (filter.status) query.status = filter.status;
    if (filter.channel) query.channel = filter.channel;

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      NotificationModel.countDocuments(query),
    ]);

    return {
      notifications: notifications as unknown as Notification[],
      total,
    };
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    const doc = await NotificationModel.create(notification);
    return doc.toObject() as unknown as Notification;
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
    data?: Partial<
      Pick<Notification, 'sentAt' | 'deliveredAt' | 'readAt' | 'failureReason' | 'retryCount'>
    >,
  ): Promise<Notification | null> {
    const update = { status, ...data };
    const doc = await NotificationModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? (doc as unknown as Notification) : null;
  }
}
