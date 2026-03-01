import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { Logger } from 'winston';
import {
  INotificationRepository,
  NotificationFilter,
} from '../../domain/repositories/notification.repository.interface';
import { ITemplateRepository } from '../../domain/repositories/template.repository.interface';
import { IPreferenceRepository } from '../../domain/repositories/preference.repository.interface';
import { IRabbitMQPublisher } from '../../infrastructure/messaging/rabbitmq.publisher';
import { TemplateEngine } from '../../shared/utils/template.engine';
import { Notification, NotificationStatus } from '../../domain/entities/notification.entity';
import { ValidationError } from '../../shared/errors';
import { components } from '../../domain/types/api.generated';
import { config } from '../../config';

type SendNotificationRequest = components['schemas']['SendNotificationRequest'];

@injectable()
export class NotificationService {
  constructor(
    @inject(TYPES.NotificationRepository) private notiRepo: INotificationRepository,
    @inject(TYPES.TemplateRepository) private templateRepo: ITemplateRepository,
    @inject(TYPES.PreferenceRepository) private preferenceRepo: IPreferenceRepository,
    @inject(TYPES.RabbitMQPublisher) private rmqPublisher: IRabbitMQPublisher,
    @inject(TYPES.TemplateEngine) private templateEngine: TemplateEngine,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async listNotifications(
    filter: NotificationFilter,
  ): Promise<{ notifications: Notification[]; total: number }> {
    return this.notiRepo.find(filter);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notiRepo.updateStatus(id, 'read', { readAt: new Date() });
  }

  async sendNotification(
    req: SendNotificationRequest,
  ): Promise<{ notificationId: string; status: NotificationStatus }> {
    // 1. Fetch Template
    const template = await this.templateRepo.findByName(req.template_name);
    if (!template?.isActive) {
      throw new ValidationError(`Template '${req.template_name}' not found or inactive`);
    }

    const channel = req.channel ?? template.channel;

    // 2. Check Preferences
    const pref = await this.preferenceRepo.findByCustomerId(req.customer_id);
    if (pref) {
      if (channel === 'email' && !pref.emailEnabled)
        throw new ValidationError('User opted out of email');
      if (channel === 'push' && !pref.pushEnabled)
        throw new ValidationError('User opted out of push');
      if (channel === 'sms' && !pref.smsEnabled) throw new ValidationError('User opted out of sms');

      // Quiet hours logic can be added here if needed
    }

    // 3. Render Body
    const variables = req.variables ?? {};
    const renderedBody = this.templateEngine.render(template.bodyTemplate, variables);
    const renderedSubject = template.subject
      ? this.templateEngine.render(template.subject, variables)
      : undefined;

    // 4. Save Notification
    const notiData: Partial<Notification> = {
      customerId: req.customer_id,
      templateId: template._id,
      channel: channel,
      status: 'pending',
      body: renderedBody,
      metadata: variables,
    };
    if (renderedSubject) notiData.subject = renderedSubject;
    const noti = await this.notiRepo.create(notiData);

    // 5. Build Queue Payload
    const queueName = config.rabbitmq.queues[channel as keyof typeof config.rabbitmq.queues];

    const payload = {
      notificationId: noti._id,
      customerId: noti.customerId,
      channel,
      subject: noti.subject,
      body: noti.body,
    };

    // 6. Publish to appropriate worker queue
    try {
      this.rmqPublisher.publish(queueName, payload);
      this.logger.info(`Notification ${noti._id} queued to ${queueName}`);
    } catch (err) {
      this.logger.error(`Failed to push notification ${noti._id} to MQ`, err);
      await this.notiRepo.updateStatus(noti._id, 'failed', { failureReason: 'MQ publish failed' });
      return { notificationId: noti._id, status: 'failed' };
    }

    return { notificationId: noti._id, status: noti.status };
  }
}
