import type { NotificationTemplate } from '../entities/template.entity';

export interface ITemplateRepository {
  findById(id: string): Promise<NotificationTemplate | null>;
  findByName(name: string): Promise<NotificationTemplate | null>;
  findAll(): Promise<NotificationTemplate[]>;
  create(template: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
  update(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate | null>;
  delete(id: string): Promise<boolean>;
}
