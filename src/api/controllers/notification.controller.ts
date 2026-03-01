import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationFilter } from '../../domain/repositories/notification.repository.interface';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { components } from '../../domain/types/api.generated';

@injectable()
export class NotificationController {
  constructor(@inject(TYPES.NotificationService) private notiService: NotificationService) {}

  public sendNotification = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as components['schemas']['SendNotificationRequest'];
    const result = await this.notiService.sendNotification(payload);
    res.status(202).json(result);
  };

  public listNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Only return notifications for the authenticated user unless admin
    const filter: NotificationFilter = {
      ...(req.user?.id ? { customerId: req.user.id } : {}),
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    if (req.user?.roles?.includes('admin') && req.query.customerId) {
      filter.customerId = req.query.customerId as string;
    }

    const result = await this.notiService.listNotifications(filter);
    res.status(200).json(result);
  };

  public markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { notificationId } = req.params;
    // In a real app we'd verify the notification belongs to req.user.id
    await this.notiService.markAsRead(notificationId ?? '');
    res.status(204).send();
  };
}
