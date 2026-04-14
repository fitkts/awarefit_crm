import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { LoginDto, UpdatePasswordDto } from './auth.schema';
import bcrypt from 'bcryptjs';

export class AuthService {
  async authenticate(dto: LoginDto) {
    const { email, password } = dto;

    const staff = await prisma.staff.findFirst({
      where: { email, deletedAt: null },
    });

    if (!staff) {
      throw new AppError('UNAUTHORIZED', 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (!staff.password) {
      throw new AppError('UNAUTHORIZED', 401, '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.');
    }

    const isValid = await bcrypt.compare(password, staff.password);
    if (!isValid) {
      throw new AppError('UNAUTHORIZED', 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // Return the safe structured mapping leaving out sensitive password bounds
    return {
      id: staff.id,
      centerId: staff.centerId,
      name: staff.name,
      role: staff.role,
    };
  }

  async setPassword(dto: UpdatePasswordDto) {
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    
    return await prisma.staff.update({
      where: { id: dto.staffId },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true },
    });
  }
}

export const authService = new AuthService();
