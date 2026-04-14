import { z } from 'zod';

export const CalculatePayrollSchema = z.object({
  targetMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "targetMonth must be in YYYY-MM format"),
});

export const QueryPayrollSchema = z.object({
  staffId: z.coerce.number().int().positive().optional(),
  targetMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
});

export type CalculatePayrollDto = z.infer<typeof CalculatePayrollSchema>;
export type QueryPayrollDto = z.infer<typeof QueryPayrollSchema>;
