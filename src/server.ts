import 'reflect-metadata';
import type * as http from 'http';
import { createApp } from './app';
import { config } from './config';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/connection';
import { logger } from './shared/logger';
import { TYPES } from './config/types';
import type { KafkaEventHandler } from './application/events/kafka.handler';
import type { EmailWorker } from './workers/email.worker';
import type { PushWorker } from './workers/push.worker';
import type { SmsWorker } from './workers/sms.worker';

import { container } from './config/inversify.config';

let server: http.Server;

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  // Start Event Consumers & Workers
  const eventHandler = container.get<KafkaEventHandler>(TYPES.KafkaEventHandler);
  await eventHandler.start();

  const emailWorker = container.get<EmailWorker>(TYPES.EmailWorker);
  await emailWorker.start();

  const pushWorker = container.get<PushWorker>(TYPES.PushWorker);
  await pushWorker.start();

  const smsWorker = container.get<SmsWorker>(TYPES.SmsWorker);
  await smsWorker.start();

  const app = createApp();

  server = app.listen(config.port, () => {
    logger.info(`ms-ga-noti listening on port ${config.port}`, { env: config.env });
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully…`);

    server.close(() => {
      logger.info('HTTP server closed');
    });

    try {
      await eventHandler.stop();
      await emailWorker.stop();
      await pushWorker.stop();
      await smsWorker.stop();
    } catch (err) {
      logger.error('Error stopping consumers/workers', err);
    }

    try {
      await disconnectMongoDB();
      logger.info('MongoDB disconnected');
    } catch (err) {
      logger.error('Error disconnecting MongoDB', err);
    }

    logger.info('Process exit');
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

bootstrap().catch((err: unknown) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
