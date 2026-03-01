import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { IPreferenceRepository } from '../../domain/repositories/preference.repository.interface';
import { NotificationPreference } from '../../domain/entities/preference.entity';
import { NotFoundError } from '../../shared/errors';

@injectable()
export class PreferenceService {
  constructor(@inject(TYPES.PreferenceRepository) private preferenceRepo: IPreferenceRepository) {}

  async getPreferences(customerId: string): Promise<NotificationPreference> {
    const pref = await this.preferenceRepo.findByCustomerId(customerId);
    if (!pref) {
      throw new NotFoundError('Preferences for customer');
    }
    return pref;
  }

  async updatePreferences(
    customerId: string,
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const updated = await this.preferenceRepo.update(customerId, data);
    if (!updated) {
      // Because of upsert, this should theoretically not happen, but just in case
      throw new NotFoundError('Preferences for customer');
    }
    return updated;
  }
}
