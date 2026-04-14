import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdatePasswordSchema = z.object({
  staffId: z.number().int().positive(),
  newPassword: z.string().min(6),
});

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;
