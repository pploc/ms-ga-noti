import { injectable } from 'inversify';
import { ITemplateRepository } from '../../domain/repositories/template.repository.interface';
import { NotificationTemplate } from '../../domain/entities/template.entity';
import { NotificationTemplateModel } from '../database/schemas/template.schema';

@injectable()
export class TemplateRepository implements ITemplateRepository {
  async findById(id: string): Promise<NotificationTemplate | null> {
    const doc = await NotificationTemplateModel.findById(id).lean();
    return doc ? (doc as unknown as NotificationTemplate) : null;
  }

  async findByName(name: string): Promise<NotificationTemplate | null> {
    const doc = await NotificationTemplateModel.findOne({ name }).lean();
    return doc ? (doc as unknown as NotificationTemplate) : null;
  }

  async findAll(): Promise<NotificationTemplate[]> {
    const docs = await NotificationTemplateModel.find().lean();
    return docs as unknown as NotificationTemplate[];
  }

  async create(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const doc = await NotificationTemplateModel.create(template);
    return doc.toObject() as unknown as NotificationTemplate;
  }

  async update(
    id: string,
    template: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate | null> {
    const doc = await NotificationTemplateModel.findByIdAndUpdate(id, template, {
      new: true,
    }).lean();
    return doc ? (doc as unknown as NotificationTemplate) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await NotificationTemplateModel.findByIdAndDelete(id);
    return result !== null;
  }
}
