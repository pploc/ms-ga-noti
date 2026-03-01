import { Container } from 'inversify';
import { TYPES } from './types';
import { logger } from '../shared/logger';
import { TemplateEngine } from '../shared/utils/template.engine';
import type { INotificationRepository } from '../domain/repositories/notification.repository.interface';
import type { ITemplateRepository } from '../domain/repositories/template.repository.interface';
import type { IPreferenceRepository } from '../domain/repositories/preference.repository.interface';
import { NotificationRepository } from '../infrastructure/repositories/notification.repository';
import { TemplateRepository } from '../infrastructure/repositories/template.repository';
import { PreferenceRepository } from '../infrastructure/repositories/preference.repository';

// Messaging
import { KafkaConsumer } from '../infrastructure/messaging/kafka.consumer';
import { RabbitMQPublisher } from '../infrastructure/messaging/rabbitmq.publisher';

// Application Services
import { NotificationService } from '../application/services/notification.service';
import { TemplateService } from '../application/services/template.service';
import { PreferenceService } from '../application/services/preference.service';
import { KafkaEventHandler } from '../application/events/kafka.handler';

// API Controllers
import { NotificationController } from '../api/controllers/notification.controller';
import { TemplateController } from '../api/controllers/template.controller';
import { PreferenceController } from '../api/controllers/preference.controller';

const container = new Container();

// ── Bind Shared ─────────────────────────────────────────────────────────────
container.bind(TYPES.Logger).toConstantValue(logger);
container.bind(TYPES.TemplateEngine).to(TemplateEngine).inSingletonScope();

// ── Bind Infrastructure ─────────────────────────────────────────────────────
container
  .bind<INotificationRepository>(TYPES.NotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();
container
  .bind<ITemplateRepository>(TYPES.TemplateRepository)
  .to(TemplateRepository)
  .inSingletonScope();
container
  .bind<IPreferenceRepository>(TYPES.PreferenceRepository)
  .to(PreferenceRepository)
  .inSingletonScope();

container.bind(TYPES.KafkaConsumer).to(KafkaConsumer).inSingletonScope();
container.bind(TYPES.RabbitMQPublisher).to(RabbitMQPublisher).inSingletonScope();

// ── Bind Application ────────────────────────────────────────────────────────
container.bind(TYPES.NotificationService).to(NotificationService).inSingletonScope();
container.bind(TYPES.TemplateService).to(TemplateService).inSingletonScope();
container.bind(TYPES.PreferenceService).to(PreferenceService).inSingletonScope();
container.bind(TYPES.KafkaEventHandler).to(KafkaEventHandler).inSingletonScope();

// ── Bind API Controllers ────────────────────────────────────────────────────
container.bind(TYPES.NotificationController).to(NotificationController).inSingletonScope();
container.bind(TYPES.TemplateController).to(TemplateController).inSingletonScope();
container.bind(TYPES.PreferenceController).to(PreferenceController).inSingletonScope();

export { container };
