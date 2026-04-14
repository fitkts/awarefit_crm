import { z } from 'zod';

export const CreateWorkoutSetSchema = z.object({
  setNo: z.number().int().positive(),
  weight: z.number().nonnegative().optional().nullable(),
  reps: z.number().int().nonnegative().optional().nullable(),
  rir: z.number().int().nonnegative().optional().nullable(),
  seconds: z.number().int().nonnegative().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const CreateWorkoutLogSchema = z.object({
  memberId: z.number().int().positive(),
  staffId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  conditionScore: z.number().int().min(1).max(5).optional().default(3),
  memo: z.string().optional().nullable(),
  sets: z.array(CreateWorkoutSetSchema).optional().default([]),
});

export const UpdateWorkoutLogSchema = CreateWorkoutLogSchema.partial();

export const QueryWorkoutLogSchema = z.object({
  memberId: z.coerce.number().int().positive().optional(),
});

export type CreateWorkoutSetDto = z.infer<typeof CreateWorkoutSetSchema>;
export type CreateWorkoutLogDto = z.infer<typeof CreateWorkoutLogSchema>;
export type UpdateWorkoutLogDto = z.infer<typeof UpdateWorkoutLogSchema>;
export type QueryWorkoutLogDto = z.infer<typeof QueryWorkoutLogSchema>;
