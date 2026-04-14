import { z } from 'zod';

export const InteractionTypeSchema = z.enum(['COUNSEL', 'CHAT', 'PHONE', 'NOTE']);

export const CreateInteractionSchema = z.object({
  memberId: z.number().int().positive(),
  type: InteractionTypeSchema,
  content: z.string().min(1),
  sentimentScore: z.number().int().min(-2).max(2).optional().nullable(),
});

export type CreateInteractionDto = z.infer<typeof CreateInteractionSchema>;
