import { z } from 'zod';

export const StaffRoleSchema = z.enum(['TRAINER', 'MANAGER', 'ADMIN']);

export const CreateStaffSchema = z.object({
  centerId: z.number().int().positive(),
  name: z.string().min(1),
  role: StaffRoleSchema,
  phone: z.string().optional(),
  email: z.string().email().optional(),
  baseSalary: z.number().int().nonnegative().optional(),
  isFreelancer: z.boolean().optional(),
  hireDate: z.coerce.date().optional(),
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

export const QueryStaffSchema = z.object({
  centerId: z.coerce.number().int().positive().optional(),
  role: StaffRoleSchema.optional(),
});

export const CommissionTypeSchema = z.enum(['PER_SESSION', 'PERCENT_SALES', 'FIXED_BONUS']);

export const CreateCommissionRuleSchema = z.object({
  type: CommissionTypeSchema.optional().default('PER_SESSION'),
  minSessions: z.number().int().nonnegative().optional().default(0),
  maxSessions: z.number().int().positive().optional().default(9999),
  rate: z.number().nonnegative(),
  effectiveFrom: z.coerce.date().optional().nullable(),
  effectiveTo: z.coerce.date().optional().nullable(),
});

export const UpdateCommissionRuleSchema = CreateCommissionRuleSchema.partial();

export type CreateStaffDto = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffDto = z.infer<typeof UpdateStaffSchema>;
export type QueryStaffDto = z.infer<typeof QueryStaffSchema>;
export type CreateCommissionRuleDto = z.infer<typeof CreateCommissionRuleSchema>;
export type UpdateCommissionRuleDto = z.infer<typeof UpdateCommissionRuleSchema>;
