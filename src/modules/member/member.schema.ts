import { z } from 'zod';

// ============================================================
// Enum constants (mirrors Prisma schema String fields)
// ============================================================
export const MEMBER_STATUS = ['ACTIVE', 'STOP', 'EXPIRED', 'DELETED'] as const;
export const GENDER = ['M', 'F'] as const;

// ============================================================
// CreateMemberDto
// ============================================================
export const CreateMemberSchema = z.object({
  centerId: z.number().int().positive(),
  name: z.string().min(1).max(50),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'),
  email: z.string().email().optional(),
  gender: z.enum(GENDER).optional(),
  birth: z.coerce.date().optional(),
});

export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;

// ============================================================
// UpdateMemberDto — all fields optional
// ============================================================
export const UpdateMemberSchema = CreateMemberSchema.omit({ centerId: true })
  .extend({
    status: z.enum(MEMBER_STATUS).optional(),
  })
  .partial();

export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;

// ============================================================
// MemberQueryDto — pagination + filters
// ============================================================
export const MemberQuerySchema = z.object({
  status: z.enum(MEMBER_STATUS).optional(),
  search: z.string().optional(), // searches name OR phone
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MemberQueryDto = z.infer<typeof MemberQuerySchema>;
