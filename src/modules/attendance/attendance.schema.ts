import { z } from 'zod';

export const CreateAttendanceSchema = z.object({
  subId: z.number().int().positive(),
  staffId: z.number().int().positive(),
});

export const QueryAttendanceSchema = z.object({
  subId: z.coerce.number().int().positive().optional(),
  memberId: z.coerce.number().int().positive().optional(),
});

export type CreateAttendanceDto = z.infer<typeof CreateAttendanceSchema>;
export type QueryAttendanceDto = z.infer<typeof QueryAttendanceSchema>;
