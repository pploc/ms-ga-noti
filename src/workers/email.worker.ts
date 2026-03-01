/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/require-await, @typescript-eslint/restrict-template-expressions */
import { injectable, inject } from 'inversify';
import * as amqp from 'amqplib';
import { Logger } from 'winston';
import { config } from '../config';
import { TYPES } from '../config/types';

@injectable()
export class EmailWorker {
  private connection: any = null;
  private channel: any = null;

  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  async start(): Promise<void> {
    this.logger.info('EmailWorker: Connecting to RabbitMQ...');

    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      const queueName = config.rabbitmq.queues.email;
      await this.channel.assertQueue(queueName, { durable: true });

      this.logger.info(`EmailWorker: Listening for messages on queue: ${queueName}`);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await this.channel.consume(queueName, async (msg: any) => {
        if (msg) {
          try {
            const payload = JSON.parse(msg.content.toString());
            this.logger.info('EmailWorker: Processing message', { payload });

            // TODO: Implement actual SendGrid integration here
            // await sendgridClient.send(...);

            this.logger.info('EmailWorker: Message processed successfully');
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('EmailWorker: Failed to process message', { error });
            // Reject message and do not requeue (send to DLX if configured)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            this.channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      this.logger.error('EmailWorker: Connection error', { error });
      // Depending on the resilience strategy, you might want to terminate the process or retry
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    this.logger.info('EmailWorker: Stopping...');
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.logger.info('EmailWorker: Stopped.');
  }
}
