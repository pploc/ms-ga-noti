import type { NotificationPreference } from '../entities/preference.entity';

export interface IPreferenceRepository {
  findByCustomerId(customerId: string): Promise<NotificationPreference | null>;
  create(preference: Partial<NotificationPreference>): Promise<NotificationPreference>;
  update(
    customerId: string,
    preference: Partial<NotificationPreference>,
  ): Promise<NotificationPreference | null>;
}
