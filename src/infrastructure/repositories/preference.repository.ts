import { injectable } from 'inversify';
import { IPreferenceRepository } from '../../domain/repositories/preference.repository.interface';
import { NotificationPreference } from '../../domain/entities/preference.entity';
import { NotificationPreferenceModel } from '../database/schemas/preference.schema';

@injectable()
export class PreferenceRepository implements IPreferenceRepository {
  async findByCustomerId(customerId: string): Promise<NotificationPreference | null> {
    const doc = await NotificationPreferenceModel.findOne({ customerId }).lean();
    return doc ? (doc as unknown as NotificationPreference) : null;
  }

  async create(preference: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const doc = await NotificationPreferenceModel.create(preference);
    return doc.toObject() as unknown as NotificationPreference;
  }

  async update(
    customerId: string,
    preference: Partial<NotificationPreference>,
  ): Promise<NotificationPreference | null> {
    const doc = await NotificationPreferenceModel.findOneAndUpdate({ customerId }, preference, {
      new: true,
      upsert: true,
    }).lean();
    return doc as unknown as NotificationPreference;
  }
}
