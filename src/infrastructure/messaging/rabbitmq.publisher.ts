/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable, inject } from 'inversify';
import * as amqp from 'amqplib';
import { config } from '../../config';
import { TYPES } from '../../config/types';
import { Logger } from 'winston';

export interface IRabbitMQPublisher {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(queue: string, message: unknown): boolean;
}

@injectable()
export class RabbitMQPublisher implements IRabbitMQPublisher {
  private connection: any = null;
  private channel: any = null;

  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  async connect(): Promise<void> {
    this.logger.info('Connecting to RabbitMQ...', { url: config.rabbitmq.url.split('@').pop() });

    this.connection = await amqp.connect(config.rabbitmq.url);
    this.channel = await this.connection.createChannel();

    // Assert required queues
    for (const queueName of Object.values(config.rabbitmq.queues)) {
      await this.channel.assertQueue(queueName, { durable: true });
    }

    this.logger.info('Connected to RabbitMQ and asserted queues.');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from RabbitMQ...');
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.info('Disconnected from RabbitMQ.');
  }

  publish(queue: string, message: unknown): boolean {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    const payload = Buffer.from(JSON.stringify(message));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.channel.sendToQueue(queue, payload, {
      persistent: true,
    });
  }
}
