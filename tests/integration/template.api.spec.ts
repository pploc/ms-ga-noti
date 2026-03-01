import 'reflect-metadata';
import request from 'supertest';
import { createApp } from '../../src/app';
import { container } from '../../src/config/inversify.config';
import { TYPES } from '../../src/config/types';

describe('Template API Integration', () => {
    let app: any;
    let mockTmplService: any;

    beforeAll(async () => {
        mockTmplService = {
            listTemplates: jest.fn(),
            getTemplate: jest.fn(),
            createTemplate: jest.fn(),
            updateTemplate: jest.fn(),
            deleteTemplate: jest.fn(),
        };

        if (container.isBound(TYPES.TemplateService)) {
            const binding = await (container.rebind(TYPES.TemplateService) as any);
            binding.toConstantValue(mockTmplService);
        } else {
            const binding = await (container.bind(TYPES.TemplateService) as any);
            binding.toConstantValue(mockTmplService);
        }

        app = createApp();
    });

    describe('GET /gymapi/v1/templates', () => {
        it('should return list of templates', async () => {
            mockTmplService.listTemplates.mockResolvedValue([]);
            const res = await request(app).get('/gymapi/v1/templates').set('x-user-id', 'u1');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
        });
    });

    describe('GET /gymapi/v1/templates/:id', () => {
        it('should return a template', async () => {
            mockTmplService.getTemplate.mockResolvedValue({ _id: 't1', name: 'test' });
            const res = await request(app).get('/gymapi/v1/templates/t1').set('x-user-id', 'u1');
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('test');
        });
    });

    describe('POST /gymapi/v1/templates', () => {
        it('should create a template', async () => {
            mockTmplService.createTemplate.mockResolvedValue({ _id: 't1', name: 'new' });
            const res = await request(app)
                .post('/gymapi/v1/templates')
                .set('x-user-id', 'u1')
                .send({ name: 'new', channel: 'email', bodyTemplate: 'hi' });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('new');
        });
    });
});
