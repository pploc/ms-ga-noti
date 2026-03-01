import 'reflect-metadata';
import request from 'supertest';
import { createApp } from '../../src/app';
import { container } from '../../src/config/inversify.config';
import { TYPES } from '../../src/config/types';

describe('Preference API Integration', () => {
    let app: any;
    let mockPrefService: any;

    beforeAll(async () => {
        mockPrefService = {
            getPreferences: jest.fn(),
            updatePreferences: jest.fn(),
        };

        if (container.isBound(TYPES.PreferenceService)) {
            const binding = await (container.rebind(TYPES.PreferenceService) as any);
            binding.toConstantValue(mockPrefService);
        } else {
            const binding = await (container.bind(TYPES.PreferenceService) as any);
            binding.toConstantValue(mockPrefService);
        }

        app = createApp();
    });

    describe('GET /gymapi/v1/preferences/me', () => {
        it('should return preferences', async () => {
            mockPrefService.getPreferences.mockResolvedValue({ customerId: 'c1', emailEnabled: true });
            const res = await request(app).get('/gymapi/v1/preferences/me').set('x-user-id', 'u1');
            expect(res.status).toBe(200);
            expect(res.body.customerId).toBe('c1');
        });
    });

    describe('PUT /gymapi/v1/preferences/me', () => {
        it('should update preferences', async () => {
            mockPrefService.updatePreferences.mockResolvedValue({ customerId: 'c1', emailEnabled: false });
            const res = await request(app)
                .put('/gymapi/v1/preferences/me')
                .set('x-user-id', 'u1')
                .send({ emailEnabled: false });
            expect(res.status).toBe(200);
            expect(res.body.emailEnabled).toBe(false);
        });
    });
});
