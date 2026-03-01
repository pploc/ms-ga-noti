import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { ITemplateRepository } from '../../domain/repositories/template.repository.interface';
import { NotificationTemplate } from '../../domain/entities/template.entity';
import { NotFoundError, ValidationError } from '../../shared/errors';

@injectable()
export class TemplateService {
  constructor(@inject(TYPES.TemplateRepository) private templateRepo: ITemplateRepository) {}

  async listTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepo.findAll();
  }

  async getTemplate(id: string): Promise<NotificationTemplate> {
    const tmpl = await this.templateRepo.findById(id);
    if (!tmpl) {
      throw new NotFoundError('Template');
    }
    return tmpl;
  }

  async createTemplate(data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    if (!data.name) {
      throw new ValidationError('Template name is required');
    }
    const existing = await this.templateRepo.findByName(data.name);
    if (existing) {
      throw new ValidationError(`Template with name '${data.name}' already exists`);
    }
    return this.templateRepo.create(data);
  }

  async updateTemplate(
    id: string,
    data: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const updated = await this.templateRepo.update(id, data);
    if (!updated) {
      throw new NotFoundError('Template');
    }
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    const deleted = await this.templateRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Template');
    }
  }
}
