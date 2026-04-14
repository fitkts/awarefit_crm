import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['EXPIRY_SOON', 'LOW_SESSION', 'CHURN_RISK', 'BIRTHDAY', 'CUSTOM']);
export const NotificationChannelSchema = z.enum(['PUSH', 'SMS', 'KAKAO', 'IN_APP']);
export const NotificationStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED', 'READ']);

export const CreateNotificationSchema = z.object({
  memberId: z.number().int().positive(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  status: NotificationStatusSchema.optional().default('PENDING'),
  title: z.string().min(1),
  body: z.string().min(1),
  payload: z.string().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
});

export const QueryNotificationSchema = z.object({
  status: NotificationStatusSchema.optional(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type QueryNotificationDto = z.infer<typeof QueryNotificationSchema>;
