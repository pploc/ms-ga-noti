import winston from 'winston';
import { config } from '../../config';

const { combine, timestamp, json, colorize, simple } = winston.format;

const isDevelopment = config.env === 'development';

export const logger = winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: isDevelopment
        ? combine(colorize(), simple())
        : combine(timestamp(), json()),
    defaultMeta: { service: 'ms-ga-noti' },
    transports: [new winston.transports.Console()],
});
