import 'reflect-metadata';
import request from 'supertest';
import { createApp } from '../../src/app';
import { container } from '../../src/config/inversify.config';
import { TYPES } from '../../src/config/types';

describe('Notification API Integration', () => {
    let app: any;
    let mockNotiService: any;

    beforeAll(async () => {
        mockNotiService = {
            sendNotification: jest.fn(),
            listNotifications: jest.fn(),
            markAsRead: jest.fn(),
        };

        // Rebind service to mock
        if (container.isBound(TYPES.NotificationService)) {
            const binding = await (container.rebind(TYPES.NotificationService) as any);
            binding.toConstantValue(mockNotiService);
        } else {
            const binding = await (container.bind(TYPES.NotificationService) as any);
            binding.toConstantValue(mockNotiService);
        }

        app = createApp();
    });

    describe('POST /gymapi/v1/notifications', () => {
        it('should return 401 if x-user-id header is missing', async () => {
            const res = await request(app).post('/gymapi/v1/notifications').send({});
            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Missing x-user-id');
        });

        it('should return 200 and notificationId on success', async () => {
            mockNotiService.sendNotification.mockResolvedValue({
                notificationId: 'n1',
                status: 'pending',
            });

            const res = await request(app)
                .post('/gymapi/v1/notifications')
                .set('x-user-id', 'u1')
                .send({
                    template_name: 'welcome_email',
                    customer_id: 'c1',
                    variables: { name: 'John' },
                });

            expect(res.status).toBe(202);
            expect(res.body.notificationId).toBe('n1');
            expect(mockNotiService.sendNotification).toHaveBeenCalled();
        });
    });

    describe('GET /gymapi/v1/notifications', () => {
        it('should return list of notifications', async () => {
            mockNotiService.listNotifications.mockResolvedValue({
                notifications: [],
                total: 0,
            });

            const res = await request(app)
                .get('/gymapi/v1/notifications')
                .set('x-user-id', 'u1')
                .query({ page: 1, limit: 10 });

            expect(res.status).toBe(200);
            expect(res.body.notifications).toBeInstanceOf(Array);
            expect(res.body.total).toBe(0);
        });
    });

    describe('POST /gymapi/v1/notifications/:id/read', () => {
        it('should mark notification as read', async () => {
            mockNotiService.markAsRead.mockResolvedValue(undefined);

            const res = await request(app)
                .post('/gymapi/v1/notifications/n1/read')
                .set('x-user-id', 'u1');

            expect(res.status).toBe(204);
            expect(mockNotiService.markAsRead).toHaveBeenCalledWith('n1');
        });
    });
});
