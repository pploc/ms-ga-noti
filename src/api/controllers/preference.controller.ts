import { Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { PreferenceService } from '../../application/services/preference.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationPreference } from '../../domain/entities/preference.entity';

@injectable()
export class PreferenceController {
  constructor(@inject(TYPES.PreferenceService) private prefService: PreferenceService) {}
  public getMyPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const customerId = req.user?.id ?? '';
    if (!customerId) {
      res.status(401).json({ status: 'error', message: 'User not authenticated' });
      return;
    }
    const pref = await this.prefService.getPreferences(customerId);
    res.status(200).json(pref);
  };

  public updateMyPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const customerId = req.user?.id ?? '';
    if (!customerId) {
      res.status(401).json({ status: 'error', message: 'User not authenticated' });
      return;
    }
    const payload = req.body as Partial<NotificationPreference>;
    const updated = await this.prefService.updatePreferences(customerId, payload);
    res.status(200).json(updated);
  };
}
