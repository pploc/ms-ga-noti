/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { NotificationPreference } from '../../../domain/entities/preference.entity';

export interface NotificationPreferenceDocument
  extends Omit<NotificationPreference, '_id'>, Document {
  _id: any;
}

const NotificationPreferenceSchema = new Schema<NotificationPreferenceDocument>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    emailEnabled: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    quietHoursStart: { type: String, default: null },
    quietHoursEnd: { type: String, default: null },
    unsubscribedTopics: [{ type: String }],
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toObject: {
      transform: (_: any, ret: any): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export const NotificationPreferenceModel = model<NotificationPreferenceDocument>(
  'NotificationPreference',
  NotificationPreferenceSchema,
);
