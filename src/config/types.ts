export const TYPES = {
  // Shared
  Logger: Symbol.for('Logger'),
  TemplateEngine: Symbol.for('TemplateEngine'),

  // Infrastructure
  NotificationRepository: Symbol.for('NotificationRepository'),
  TemplateRepository: Symbol.for('TemplateRepository'),
  PreferenceRepository: Symbol.for('PreferenceRepository'),
  KafkaConsumer: Symbol.for('KafkaConsumer'),
  RabbitMQPublisher: Symbol.for('RabbitMQPublisher'),

  // Application
  NotificationService: Symbol.for('NotificationService'),
  TemplateService: Symbol.for('TemplateService'),
  PreferenceService: Symbol.for('PreferenceService'),
  KafkaEventHandler: Symbol.for('KafkaEventHandler'),

  // Workers
  EmailWorker: Symbol.for('EmailWorker'),
  PushWorker: Symbol.for('PushWorker'),
  SmsWorker: Symbol.for('SmsWorker'),

  // API Controllers
  NotificationController: Symbol.for('NotificationController'),
  TemplateController: Symbol.for('TemplateController'),
  PreferenceController: Symbol.for('PreferenceController'),
};
