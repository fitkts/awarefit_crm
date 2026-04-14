import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NOSHOW']);

const BaseAppointmentSchema = z.object({
  subId: z.number().int().positive(),
  staffId: z.number().int().positive(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  notes: z.string().optional(),
});

export const CreateAppointmentSchema = BaseAppointmentSchema.refine(data => data.startTime < data.endTime, {
  message: 'startTime must be before endTime',
  path: ['endTime']
});

export const UpdateAppointmentSchema = BaseAppointmentSchema.partial();

export const CancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Reason is required for cancellation'),
});

export const QueryAppointmentSchema = z.object({
  status: appointmentStatusSchema.optional(),
  staffId: z.coerce.number().int().positive().optional(),
  subId: z.coerce.number().int().positive().optional(),
  date: z.coerce.date().optional(),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentSchema>;
export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>;
export type QueryAppointmentDto = z.infer<typeof QueryAppointmentSchema>;
