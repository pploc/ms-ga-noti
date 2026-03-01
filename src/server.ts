import 'reflect-metadata';
import { createApp } from './app';
import { config } from './config';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/connection';
import { logger } from './shared/logger';

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`ms-ga-noti listening on port ${config.port}`, { env: config.env });
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}. Shutting down gracefully…`);
    server.close(() => {
      void disconnectMongoDB().then(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
}

bootstrap().catch((err: unknown) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
