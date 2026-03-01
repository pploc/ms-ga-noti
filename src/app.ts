import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './shared/errors';
import { logger } from './shared/logger';

export function createApp(): express.Application {
    const app = express();

    // ── Security & parsing middleware ──────────────────────────────────────────
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));

    // ── Correlation ID ────────────────────────────────────────────────────────
    app.use((req: Request, _res: Response, next: NextFunction): void => {
        req.headers['x-correlation-id'] ??= uuidv4();
        next();
    });

    // ── Request logging ───────────────────────────────────────────────────────
    app.use((req: Request, _res: Response, next: NextFunction): void => {
        logger.info('Incoming request', {
            method: req.method,
            path: req.path,
            correlationId: req.headers['x-correlation-id'],
        });
        next();
    });

    // ── Health check ──────────────────────────────────────────────────────────
    app.get('/health', (_req: Request, res: Response): void => {
        res.status(200).json({ status: 'ok', service: 'ms-ga-noti' });
    });

    // ── API routes (placeholder — populated per feature) ─────────────────────
    // app.use('/gymapi/v1/notifications', notificationRouter);

    // ── 404 handler ───────────────────────────────────────────────────────────
    app.use((_req: Request, res: Response): void => {
        res.status(404).json({ status: 'error', message: 'Route not found' });
    });

    // ── Global error handler ──────────────────────────────────────────────────
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
        if (err instanceof AppError) {
            logger.warn('Operational error', { message: err.message, statusCode: err.statusCode });
            res.status(err.statusCode).json({ status: 'error', message: err.message });
            return;
        }

        logger.error('Unexpected error', { error: err });
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    });

    return app;
}
