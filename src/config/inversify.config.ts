import { Container } from 'inversify';
import { TYPES } from './types';
import { logger } from '../shared/logger';
import { TemplateEngine } from '../shared/utils/template.engine';

const container = new Container();

// ── Bind Shared ─────────────────────────────────────────────────────────────
container.bind(TYPES.Logger).toConstantValue(logger);
container.bind(TYPES.TemplateEngine).toSelf().inSingletonScope();

// ── Bind Infrastructure ─────────────────────────────────────────────────────
// (To be added as we implement them)

// ── Bind Application ────────────────────────────────────────────────────────
// (To be added as we implement them)

export { container };
