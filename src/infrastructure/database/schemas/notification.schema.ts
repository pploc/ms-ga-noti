/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { Notification } from '../../../domain/entities/notification.entity';

export interface NotificationDocument extends Omit<Notification, '_id'>, Document {
  _id: any;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    customerId: { type: String, required: true, index: true },
    templateId: { type: String, ref: 'NotificationTemplate', required: true },
    channel: { type: String, enum: ['email', 'push', 'sms'], required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
      default: 'pending',
      index: true,
    },
    subject: { type: String },
    body: { type: String, required: true },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failureReason: { type: String },
    retryCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_: any, ret: any): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

NotificationSchema.index({ customerId: 1, createdAt: -1 });
NotificationSchema.virtual('id').get(function (this: any): string {
  return this._id.toString();
});
NotificationSchema.index({ status: 1, createdAt: -1 });

export const NotificationModel = model<NotificationDocument>('Notification', NotificationSchema);
