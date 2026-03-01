import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../shared/logger';

export async function connectMongoDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongodb.uri);
        logger.info('MongoDB connected', { uri: config.mongodb.uri });
    } catch (error) {
        logger.error('MongoDB connection failed', { error });
        throw error;
    }
}

export async function disconnectMongoDB(): Promise<void> {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
}
