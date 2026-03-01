import 'dotenv/config';

function requireEnv(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optionalEnv(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
}

export const config = {
    port: optionalEnv('PORT', '8091'),
    env: optionalEnv('APP_ENV', 'development'),

    mongodb: {
        uri: optionalEnv('MONGODB_URI', 'mongodb://localhost:27017/noti_db'),
    },

    kafka: {
        brokers: optionalEnv('KAFKA_BROKERS', 'localhost:9092').split(','),
        groupId: optionalEnv('KAFKA_GROUP_ID', 'ms-ga-noti'),
        topics: [
            'identity.events',
            'membership.events',
            'booking.events',
            'payment.events',
            'customer.events',
            'trainer.events',
            'supplement.events',
        ] as const,
    },

    rabbitmq: {
        url: optionalEnv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672'),
        queues: {
            email: 'noti.email',
            push: 'noti.push',
            sms: 'noti.sms',
            deadLetter: 'noti.dead-letter',
        } as const,
        exchanges: {
            notifications: 'notifications',
            deadLetter: 'notifications.dlx',
        } as const,
        maxRetries: parseInt(optionalEnv('MAX_RETRIES', '3'), 10),
    },

    email: {
        provider: optionalEnv('EMAIL_PROVIDER', 'sendgrid') as 'sendgrid' | 'ses',
        sendgrid: {
            apiKey: optionalEnv('SENDGRID_API_KEY', ''),
            fromEmail: optionalEnv('FROM_EMAIL', 'noreply@gymapi.com'),
            fromName: optionalEnv('FROM_NAME', 'GymAPI'),
        },
    },

    push: {
        fcm: {
            serverKey: optionalEnv('FCM_SERVER_KEY', ''),
        },
    },

    sms: {
        twilio: {
            accountSid: optionalEnv('TWILIO_ACCOUNT_SID', ''),
            authToken: optionalEnv('TWILIO_AUTH_TOKEN', ''),
            fromNumber: optionalEnv('TWILIO_FROM_NUMBER', ''),
        },
    },
} as const;

export type Config = typeof config;

// Validate critical secrets in production
if (config.env === 'production') {
    requireEnv('MONGODB_URI');
    requireEnv('KAFKA_BROKERS');
    requireEnv('RABBITMQ_URL');
}
