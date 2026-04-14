import { z } from 'zod';

// ============================================================
// Enum constants (matching Prisma schema string literals)
// ============================================================
export const SUBSCRIPTION_STATUS = ['ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED', 'TRANSFERRED'] as const;
export const PAYMENT_METHOD = ['CARD', 'CASH', 'TRANSFER', 'ACCOUNT'] as const;

// ============================================================
// CreateSubscriptionDto
// ============================================================
export const CreateSubscriptionSchema = z.object({
  memberId: z.number().int().positive(),
  productId: z.number().int().positive(),
  staffId: z.number().int().positive(),
  
  startDate: z.coerce.date().default(() => new Date()),
  discountAmount: z.number().int().min(0).default(0),
  autoRenew: z.boolean().default(false),
  notes: z.string().optional(),

  // Payment information necessary to initialize a subscription
  paymentAmount: z.number().int().min(0),
  paymentMethod: z.enum(PAYMENT_METHOD),
});

export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>;

// ============================================================
// PauseSubscriptionDto
// ============================================================
export const PauseSubscriptionSchema = z.object({
  reason: z.string().optional(),
  pausedAt: z.coerce.date().default(() => new Date()),
});

export type PauseSubscriptionDto = z.infer<typeof PauseSubscriptionSchema>;

// ============================================================
// TransferSubscriptionDto
// ============================================================
export const TransferSubscriptionSchema = z.object({
  toMemberId: z.number().int().positive(),
  transferFee: z.number().int().min(0).default(0),
  reason: z.string().optional(),
});

export type TransferSubscriptionDto = z.infer<typeof TransferSubscriptionSchema>;

// ============================================================
// SubscriptionQueryDto (Optional)
// ============================================================
export const SubscriptionQuerySchema = z.object({
  status: z.enum(SUBSCRIPTION_STATUS).optional(),
});

export type SubscriptionQueryDto = z.infer<typeof SubscriptionQuerySchema>;
