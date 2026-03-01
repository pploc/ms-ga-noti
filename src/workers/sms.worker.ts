/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/require-await, @typescript-eslint/restrict-template-expressions */
import { injectable, inject } from 'inversify';
import * as amqp from 'amqplib';
import { Logger } from 'winston';
import { config } from '../config';
import { TYPES } from '../config/types';

@injectable()
export class SmsWorker {
  private connection: any = null;
  private channel: any = null;

  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  async start(): Promise<void> {
    this.logger.info('SmsWorker: Connecting to RabbitMQ...');

    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      const queueName = config.rabbitmq.queues.sms;
      await this.channel.assertQueue(queueName, { durable: true });

      this.logger.info(`SmsWorker: Listening for messages on queue: ${queueName}`);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await this.channel.consume(queueName, async (msg: any) => {
        if (msg) {
          try {
            const payload = JSON.parse(msg.content.toString());
            this.logger.info('SmsWorker: Processing message', { payload });

            // TODO: Implement actual Twilio integration here

            this.logger.info('SmsWorker: Message processed successfully');
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('SmsWorker: Failed to process message', { error });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            this.channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      this.logger.error('SmsWorker: Connection error', { error });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    this.logger.info('SmsWorker: Stopping...');
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.logger.info('SmsWorker: Stopped.');
  }
}
