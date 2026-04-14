import { z } from 'zod';

export const MeasurementTypeSchema = z.enum(['WEIGHT', 'INBODY', 'CIRCUMFERENCE', 'CUSTOM']);

export const CreateMeasurementSchema = z.object({
  memberId: z.number().int().positive(),
  type: MeasurementTypeSchema,
  measuredAt: z.coerce.date().optional(),
  
  weight: z.number().nonnegative().optional().nullable(),
  bodyFat: z.number().nonnegative().optional().nullable(),
  muscleMass: z.number().nonnegative().optional().nullable(),
  bmi: z.number().nonnegative().optional().nullable(),
  
  visceralFat: z.number().int().nonnegative().optional().nullable(),
  basalMetabolic: z.number().int().nonnegative().optional().nullable(),
  bodyWater: z.number().nonnegative().optional().nullable(),
  
  chest: z.number().nonnegative().optional().nullable(),
  waist: z.number().nonnegative().optional().nullable(),
  hip: z.number().nonnegative().optional().nullable(),
  thigh: z.number().nonnegative().optional().nullable(),
  arm: z.number().nonnegative().optional().nullable(),
  
  customKey: z.string().optional().nullable(),
  customVal: z.number().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export type CreateMeasurementDto = z.infer<typeof CreateMeasurementSchema>;
