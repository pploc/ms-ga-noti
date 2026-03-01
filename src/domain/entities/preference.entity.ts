export interface NotificationPreference {
  _id: string;
  customerId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  unsubscribedTopics: string[];
  updatedAt: Date;
}
