import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { TemplateService } from '../../application/services/template.service';
import { NotificationTemplate } from '../../domain/entities/template.entity';

@injectable()
export class TemplateController {
  constructor(@inject(TYPES.TemplateService) private tmplService: TemplateService) {}

  public listTemplates = async (req: Request, res: Response): Promise<void> => {
    const templates = await this.tmplService.listTemplates();
    res.status(200).json(templates);
  };

  public getTemplate = async (req: Request, res: Response): Promise<void> => {
    const template = await this.tmplService.getTemplate(req.params.id ?? '');
    res.status(200).json(template);
  };

  public createTemplate = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as Partial<NotificationTemplate>;
    const template = await this.tmplService.createTemplate(payload);
    res.status(201).json(template);
  };

  public updateTemplate = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as Partial<NotificationTemplate>;
    const template = await this.tmplService.updateTemplate(req.params.id ?? '', payload);
    res.status(200).json(template);
  };

  public deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    await this.tmplService.deleteTemplate(req.params.id ?? '');
    res.status(204).send();
  };
}
