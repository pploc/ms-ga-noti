import 'reflect-metadata';
import { TemplateService } from '../../../src/application/services/template.service';
import { ITemplateRepository } from '../../../src/domain/repositories/template.repository.interface';
import { NotificationTemplate } from '../../../src/domain/entities/template.entity';

describe('TemplateService', () => {
    let tmplService: TemplateService;
    let tmplRepo: jest.Mocked<ITemplateRepository>;

    const mockDate = new Date();
    const mockTemplate: any = {
        _id: 't1',
        name: 'welcome_email',
        channel: 'email',
        bodyTemplate: 'Hi {{name}}',
        variables: ['name'],
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    beforeEach(() => {
        tmplRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        tmplService = new TemplateService(tmplRepo);
    });

    describe('listTemplates', () => {
        it('should return all templates from repo', async () => {
            tmplRepo.findAll.mockResolvedValue([mockTemplate]);
            const result = await tmplService.listTemplates();
            expect(tmplRepo.findAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockTemplate);
        });
    });

    describe('getTemplate', () => {
        it('should return template if found', async () => {
            tmplRepo.findById.mockResolvedValue(mockTemplate);
            const result = await tmplService.getTemplate('t1');
            expect(tmplRepo.findById).toHaveBeenCalledWith('t1');
            expect(result).toEqual(mockTemplate);
        });

        it('should throw NotFoundError if template not found', async () => {
            tmplRepo.findById.mockResolvedValue(null);
            await expect(tmplService.getTemplate('t1')).rejects.toThrow('Template not found');
        });
    });

    describe('createTemplate', () => {
        it('should create template if incoming data is valid and name is unique', async () => {
            tmplRepo.findByName.mockResolvedValue(null);
            tmplRepo.create.mockResolvedValue(mockTemplate);

            const result = await tmplService.createTemplate({ name: 'welcome_email', channel: 'email' });
            expect(tmplRepo.findByName).toHaveBeenCalledWith('welcome_email');
            expect(tmplRepo.create).toHaveBeenCalledWith({ name: 'welcome_email', channel: 'email' });
            expect(result).toEqual(mockTemplate);
        });

        it('should throw ValidationError if name is not provided', async () => {
            await expect(tmplService.createTemplate({ channel: 'push' })).rejects.toThrow(
                'Template name is required',
            );
        });

        it('should throw ValidationError if template name already exists', async () => {
            tmplRepo.findByName.mockResolvedValue(mockTemplate);
            await expect(tmplService.createTemplate({ name: 'welcome_email' })).rejects.toThrow(
                "Template with name 'welcome_email' already exists",
            );
        });
    });

    describe('updateTemplate', () => {
        it('should update and return template if found', async () => {
            tmplRepo.update.mockResolvedValue(mockTemplate);
            const result = await tmplService.updateTemplate('t1', { subject: 'New Subject' });
            expect(tmplRepo.update).toHaveBeenCalledWith('t1', { subject: 'New Subject' });
            expect(result).toEqual(mockTemplate);
        });

        it('should throw NotFoundError if template to update is not found', async () => {
            tmplRepo.update.mockResolvedValue(null);
            await expect(tmplService.updateTemplate('t1', { subject: 'New' })).rejects.toThrow(
                'Template not found',
            );
        });
    });

    describe('deleteTemplate', () => {
        it('should delete template if found', async () => {
            tmplRepo.delete.mockResolvedValue(true);
            await tmplService.deleteTemplate('t1');
            expect(tmplRepo.delete).toHaveBeenCalledWith('t1');
        });

        it('should throw NotFoundError if template to delete is not found', async () => {
            tmplRepo.delete.mockResolvedValue(false);
            await expect(tmplService.deleteTemplate('t1')).rejects.toThrow('Template not found');
        });
    });
});
