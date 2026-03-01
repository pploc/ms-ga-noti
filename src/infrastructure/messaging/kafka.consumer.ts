import { injectable, inject } from 'inversify';
import { Kafka, Consumer } from 'kafkajs';
import { config } from '../../config';
import { TYPES } from '../../config/types';
import { Logger } from 'winston';

export interface IKafkaConsumer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startConsuming(
    topics: string[],
    handler: (topic: string, message: unknown) => Promise<void>,
  ): Promise<void>;
}

@injectable()
export class KafkaConsumer implements IKafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(@inject(TYPES.Logger) private logger: Logger) {
    this.kafka = new Kafka({
      clientId: 'ms-ga-noti',
      brokers: config.kafka.brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: config.kafka.groupId });
  }

  async connect(): Promise<void> {
    this.logger.info('Connecting to Kafka...', { brokers: config.kafka.brokers });
    await this.consumer.connect();
    this.logger.info('Connected to Kafka.');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from Kafka...');
    await this.consumer.disconnect();
    this.logger.info('Disconnected from Kafka.');
  }

  async startConsuming(
    topics: string[],
    handler: (topic: string, message: unknown) => Promise<void>,
  ): Promise<void> {
    await this.consumer.subscribe({ topics, fromBeginning: false });
    this.logger.info(`Subscribed to Kafka topics: ${topics.join(', ')}`);

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        try {
          const parsedMessage = JSON.parse(message.value.toString()) as unknown;
          await handler(topic, parsedMessage);
        } catch (error) {
          this.logger.error(`Error processing Kafka message on topic ${topic}`, {
            error,
            partition,
          });
        }
      },
    });
  }
}
