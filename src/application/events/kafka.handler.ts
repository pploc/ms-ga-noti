import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { IKafkaConsumer } from '../../infrastructure/messaging/kafka.consumer';
import { NotificationService } from '../services/notification.service';
import { Logger } from 'winston';

@injectable()
export class KafkaEventHandler {
  constructor(
    @inject(TYPES.KafkaConsumer) private consumer: IKafkaConsumer,
    @inject(TYPES.NotificationService) private notiService: NotificationService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async start(): Promise<void> {
    const topics = [
      'identity-events',
      'booking-events',
      'payment-events',
      'membership-events',
      'customer-events',
      'trainer-events',
    ];

    await this.consumer.startConsuming(topics, async (topic, message) => {
      await this.handleEvent(topic, message as Record<string, unknown>);
    });
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleEvent(topic: string, event: Record<string, unknown>): Promise<void> {
    this.logger.info(`Received event on topic ${topic}`, { eventType: event.type });

    // Map business events to notification templates
    const customerId = (event.customerId ?? event.userId) as string | undefined;
    if (!customerId) {
      this.logger.warn('Event missing customerId/userId, skipping notification', { event });
      return;
    }

    try {
      let templateName = '';
      const variables = event.payload ? (event.payload as Record<string, unknown>) : event;

      switch (event.type) {
        case 'USER_REGISTERED':
          templateName = 'welcome_email';
          break;
        case 'BOOKING_CREATED':
          templateName = 'booking_confirmation';
          break;
        case 'PAYMENT_SUCCESS':
          templateName = 'payment_receipt';
          break;
        default:
          // Unhandled event type, ignore silently
          return;
      }

      if (templateName) {
        await this.notiService.sendNotification({
          customer_id: customerId,
          template_name: templateName,
          variables,
        });
        this.logger.info(`Dispatched notification for event ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error processing event ${String(event.type)}`, err);
    }
  }
}
