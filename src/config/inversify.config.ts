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

// ── Bind Application ────────────────────────────────────────────────────────
// (To be added as we implement them)

export { container };
