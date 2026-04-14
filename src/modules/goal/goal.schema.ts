import { z } from 'zod';

export const GoalStatusSchema = z.enum(['IN_PROGRESS', 'ACHIEVED', 'PAUSED', 'CANCELLED']);

export const CreateGoalSchema = z.object({
  memberId: z.number().int().positive(),
  title: z.string().min(1),
  targetValue: z.number().optional().nullable(),
  targetUnit: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
  status: GoalStatusSchema.optional().default('IN_PROGRESS'),
  memo: z.string().optional().nullable(),
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const QueryGoalSchema = z.object({
  memberId: z.coerce.number().int().positive().optional(),
  status: GoalStatusSchema.optional(),
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type QueryGoalDto = z.infer<typeof QueryGoalSchema>;
