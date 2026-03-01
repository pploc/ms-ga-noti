import 'reflect-metadata';
import { container } from '../config/inversify.config';
import { TYPES } from '../config/types';
import { connectMongoDB, disconnectMongoDB } from '../infrastructure/database/connection';
import type { TemplateService } from '../application/services/template.service';
import { logger } from '../shared/logger';
import type { NotificationTemplate } from '../domain/entities/template.entity';

const defaultTemplates: Partial<NotificationTemplate>[] = [
  {
    name: 'welcome_email',
    channel: 'email',
    subject: 'Welcome to GymAPI!',
    bodyTemplate: 'Hi {{name}},\n\nWelcome to GymAPI. We are excited to have you on board.',
    variables: ['name'],
    isActive: true,
  },
  {
    name: 'booking_confirmation',
    channel: 'email',
    subject: 'Your Booking Confirmation',
    bodyTemplate: 'Hi {{name}},\n\nYour booking for {{className}} at {{time}} is confirmed.',
    variables: ['name', 'className', 'time'],
    isActive: true,
  },
  {
    name: 'payment_receipt',
    channel: 'email',
    subject: 'Payment Receipt',
    bodyTemplate:
      'Hi {{name}},\n\nWe have received your payment of {{amount}} for {{description}}.',
    variables: ['name', 'amount', 'description'],
    isActive: true,
  },
  {
    name: 'class_reminder',
    channel: 'push',
    bodyTemplate: 'Reminder: Your class {{className}} starts in 1 hour.',
    variables: ['className'],
    isActive: true,
  },
];

async function seedTemplates(): Promise<void> {
  logger.info('Connecting to MongoDB for seeding...');
  await connectMongoDB();

  const templateService = container.get<TemplateService>(TYPES.TemplateService);

  for (const template of defaultTemplates) {
    try {
      if (!template.name) continue;

      logger.info(`Checking if template '${template.name}' exists...`);
      // check if it exists or not

      const existingTemplates = await templateService.listTemplates();
      const exists = existingTemplates.some((t) => t.name === template.name);

      if (exists) {
        logger.info(`Template '${template.name}' already exists. Skipping.`);
        continue;
      }

      await templateService.createTemplate(template);
      logger.info(`Template '${template.name}' seeded successfully.`);
    } catch (err: unknown) {
      logger.error(`Error seeding template '${template.name ?? 'unknown'}'`, err);
    }
  }

  logger.info('Seeding complete. Disconnecting...');
  await disconnectMongoDB();
  process.exit(0);
}

seedTemplates().catch((err: unknown) => {
  logger.error('Fatal error during seeding', err);
  process.exit(1);
});
