import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import {
  CreateStaffDto,
  UpdateStaffDto,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto
} from './staff.schema';

export class StaffService {
  async findAll() {
    return await prisma.staff.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        commissionRules: true,
      },
    });

    if (!staff || staff.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Staff not found');
    }

    return staff;
  }

  async create(dto: CreateStaffDto) {
    // Optionally check if centerId exists
    const center = await prisma.center.findUnique({ where: { id: dto.centerId } });
    if (!center) {
      throw new AppError('NOT_FOUND', 404, 'Center not found');
    }

    if (dto.email) {
      const existing = await prisma.staff.findUnique({
        where: { centerId_email: { centerId: dto.centerId, email: dto.email } }
      });
      if (existing) {
        throw new AppError('CONFLICT', 409, 'Staff with this email already exists in center');
      }
    }

    return await prisma.staff.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.findById(id);

    return await prisma.staff.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    await this.findById(id);
    return await prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Sub-resource: Commission Rules ---

  async getCommissionRules(staffId: number) {
    await this.findById(staffId); // Ensure staff exists
    return await prisma.commissionRule.findMany({
      where: { staffId },
      orderBy: { id: 'desc' },
    });
  }

  async addCommissionRule(staffId: number, dto: CreateCommissionRuleDto) {
    await this.findById(staffId); // Ensure staff exists

    // Check overlap logic (Optional based on rules, here we enforce unique min/max range)
    const existing = await prisma.commissionRule.findUnique({
      where: {
        staffId_minSessions_maxSessions: {
          staffId,
          minSessions: dto.minSessions,
          maxSessions: dto.maxSessions,
        }
      }
    });

    if (existing) {
      throw new AppError('CONFLICT', 409, 'Commission rule with this session range already exists');
    }

    return await prisma.commissionRule.create({
      data: {
        ...dto,
        staffId,
      },
    });
  }
}

export const staffService = new StaffService();
