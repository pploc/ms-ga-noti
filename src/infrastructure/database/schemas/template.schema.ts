/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { NotificationTemplate } from '../../../domain/entities/template.entity';

export interface NotificationTemplateDocument extends Omit<NotificationTemplate, '_id'>, Document {
  _id: any;
}

const NotificationTemplateSchema = new Schema<NotificationTemplateDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: ['email', 'push', 'sms'], required: true },
    subject: { type: String },
    bodyTemplate: { type: String, required: true },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export const NotificationTemplateModel = model<NotificationTemplateDocument>(
  'NotificationTemplate',
  NotificationTemplateSchema,
);
