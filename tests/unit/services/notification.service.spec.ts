import 'reflect-metadata';
import { NotificationService } from '../../../src/application/services/notification.service';
import { INotificationRepository } from '../../../src/domain/repositories/notification.repository.interface';
import { ITemplateRepository } from '../../../src/domain/repositories/template.repository.interface';
import { IPreferenceRepository } from '../../../src/domain/repositories/preference.repository.interface';
import { IRabbitMQPublisher } from '../../../src/infrastructure/messaging/rabbitmq.publisher';
import { TemplateEngine } from '../../../src/shared/utils/template.engine';
import { Logger } from 'winston';

describe('NotificationService', () => {
    let notiService: NotificationService;
    let notiRepo: jest.Mocked<INotificationRepository>;
    let templateRepo: jest.Mocked<ITemplateRepository>;
    let preferenceRepo: jest.Mocked<IPreferenceRepository>;
    let rmqPublisher: jest.Mocked<IRabbitMQPublisher>;
    let templateEngine: jest.Mocked<TemplateEngine>;
    let logger: jest.Mocked<Logger>;

    beforeEach(() => {
        notiRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            find: jest.fn(),
            countByCustomerAndStatus: jest.fn(),
            markManyAsRead: jest.fn(),
        } as any;

        templateRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        preferenceRepo = {
            findByCustomerId: jest.fn(),
            upsert: jest.fn(),
        } as any;

        rmqPublisher = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            publish: jest.fn(),
        } as any;

        templateEngine = {
            render: jest.fn(),
        } as any;

        logger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as any;

        notiService = new NotificationService(
            notiRepo,
            templateRepo,
            preferenceRepo,
            rmqPublisher,
            templateEngine,
            logger,
        );
    });

    describe('sendNotification', () => {
        it('should throw ValidationError if template not found or inactive', async () => {
            templateRepo.findByName.mockResolvedValue(null);

            await expect(
                notiService.sendNotification({ customer_id: 'c1', template_name: 'test' }),
            ).rejects.toThrow("Template 'test' not found or inactive");
        });

        it('should throw ValidationError if user opted out of email', async () => {
            templateRepo.findByName.mockResolvedValue({
                _id: 't1',
                name: 'test',
                channel: 'email',
                isActive: true,
                bodyTemplate: 'Hi {{name}}',
                variables: ['name'],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            preferenceRepo.findByCustomerId.mockResolvedValue({
                _id: 'p1',
                customerId: 'c1',
                emailEnabled: false,
                pushEnabled: true,
                smsEnabled: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            await expect(
                notiService.sendNotification({ customer_id: 'c1', template_name: 'test' }),
            ).rejects.toThrow('User opted out of email');
        });

        it('should correctly format body, save, and publish for a valid request', async () => {
            templateRepo.findByName.mockResolvedValue({
                _id: 't1',
                name: 'test',
                channel: 'email',
                isActive: true,
                subject: 'Hey',
                bodyTemplate: 'Hi {{name}}',
                variables: ['name'],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            preferenceRepo.findByCustomerId.mockResolvedValue(null); // No explicit preferences => default allow

            templateEngine.render.mockImplementation((template, vars: any) => {
                if (template === 'Hi {{name}}') return `Hi ${vars.name}`;
                if (template === 'Hey') return 'Hey';
                return '';
            });

            notiRepo.create.mockResolvedValue({
                _id: 'n1',
                customerId: 'c1',
                templateId: 't1',
                channel: 'email',
                status: 'pending',
                body: 'Hi John',
                subject: 'Hey',
                metadata: { name: 'John' },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            const res = await notiService.sendNotification({
                customer_id: 'c1',
                template_name: 'test',
                variables: { name: 'John' },
            });

            expect(res.notificationId).toBe('n1');
            expect(res.status).toBe('pending');
            expect(templateEngine.render).toHaveBeenCalledTimes(2);
            expect(notiRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    customerId: 'c1',
                    channel: 'email',
                    body: 'Hi John',
                }),
            );
            expect(rmqPublisher.publish).toHaveBeenCalledWith(
                'noti.email',
                expect.objectContaining({
                    notificationId: 'n1',
                    customerId: 'c1',
                    channel: 'email',
                    body: 'Hi John',
                }),
            );
        });
    });

    describe('markAsRead', () => {
        it('should call updateStatus on the repo', async () => {
            await notiService.markAsRead('n1');
            expect(notiRepo.updateStatus).toHaveBeenCalledWith(
                'n1',
                'read',
                expect.objectContaining({ readAt: expect.any(Date) }),
            );
        });
    });

    describe('listNotifications', () => {
        it('should delegate to repo.find', async () => {
            notiRepo.find.mockResolvedValue({ notifications: [], total: 0 });
            const result = await notiService.listNotifications({ page: 1, limit: 10 });
            expect(notiRepo.find).toHaveBeenCalledWith({ page: 1, limit: 10 });
            expect(result.total).toBe(0);
        });
    });
});
