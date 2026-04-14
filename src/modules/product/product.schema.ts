import { z } from 'zod';

export const ProductCategorySchema = z.enum(['PT', 'MEMBERSHIP', 'PILATES', 'ETC']);

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  category: ProductCategorySchema.optional().default('PT'),
  price: z.number().int().nonnegative(),
  sessionCnt: z.number().int(), // -1 allowed
  validDays: z.number().int().nonnegative(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const QueryProductSchema = z.object({
  category: ProductCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type QueryProductDto = z.infer<typeof QueryProductSchema>;
