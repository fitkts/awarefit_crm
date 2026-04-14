import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import type { CreateMemberDto, MemberQueryDto, UpdateMemberDto } from './member.schema';

// ============================================================
// MemberService
// ============================================================
export class MemberService {
  // ----------------------------------------------------------
  // findAll — paginated list with optional status / text search
  // ----------------------------------------------------------
  async findAll(centerId: number, query: MemberQueryDto) {
    const { status, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      centerId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          healthProfile: true,
          insight: true,
        },
      }),
    ]);

    logger.debug({ centerId, query, total }, 'MemberService.findAll');

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ----------------------------------------------------------
  // findById — member + healthProfile + insight
  // ----------------------------------------------------------
  async findById(id: number) {
    const member = await prisma.member.findFirst({
      where: { id, deletedAt: null },
      include: {
        healthProfile: true,
        insight: true,
      },
    });

    if (!member) {
      throw new AppError('MEMBER_NOT_FOUND', 404, `회원을 찾을 수 없습니다. (id=${id})`);
    }

    return member;
  }

  // ----------------------------------------------------------
  // create — member + healthProfile + insight (single transaction)
  // ----------------------------------------------------------
  async create(dto: CreateMemberDto) {
    // 동일 센터 내 전화번호 중복 체크
    const existing = await prisma.member.findFirst({
      where: { centerId: dto.centerId, phone: dto.phone, deletedAt: null },
    });

    if (existing) {
      throw new AppError(
        'MEMBER_PHONE_CONFLICT',
        409,
        `이미 등록된 전화번호입니다. (phone=${dto.phone})`,
      );
    }

    const [member] = await prisma.$transaction(async (tx) => {
      const created = await tx.member.create({
        data: {
          centerId: dto.centerId,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          gender: dto.gender,
          birth: dto.birth,
          status: 'ACTIVE',
        },
      });

      await tx.healthProfile.create({
        data: { memberId: created.id },
      });

      await tx.memberInsight.create({
        data: { memberId: created.id },
      });

      return [created];
    });

    logger.info({ memberId: member.id }, 'MemberService.create — member created');
    return member;
  }

  // ----------------------------------------------------------
  // update — partial update of member fields
  // ----------------------------------------------------------
  async update(id: number, dto: UpdateMemberDto) {
    const member = await prisma.member.findFirst({
      where: { id, deletedAt: null },
    });

    if (!member) {
      throw new AppError('MEMBER_NOT_FOUND', 404, `회원을 찾을 수 없습니다. (id=${id})`);
    }

    // 전화번호 변경 시 중복 체크
    if (dto.phone && dto.phone !== member.phone) {
      const conflict = await prisma.member.findFirst({
        where: { centerId: member.centerId, phone: dto.phone, deletedAt: null },
      });
      if (conflict) {
        throw new AppError(
          'MEMBER_PHONE_CONFLICT',
          409,
          `이미 등록된 전화번호입니다. (phone=${dto.phone})`,
        );
      }
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.birth !== undefined && { birth: dto.birth }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    logger.info({ memberId: id }, 'MemberService.update');
    return updated;
  }

  // ----------------------------------------------------------
  // softDelete — set status=DELETED, deletedAt=now()
  // ----------------------------------------------------------
  async softDelete(id: number) {
    const member = await prisma.member.findFirst({
      where: { id, deletedAt: null },
    });

    if (!member) {
      throw new AppError('MEMBER_NOT_FOUND', 404, `회원을 찾을 수 없습니다. (id=${id})`);
    }

    if (member.status === 'DELETED') {
      throw new AppError('MEMBER_ALREADY_DELETED', 409, `이미 삭제된 회원입니다. (id=${id})`);
    }

    await prisma.member.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    logger.info({ memberId: id }, 'MemberService.softDelete');
    return { id, deleted: true };
  }

  // ----------------------------------------------------------
  // searchByPhone — 전화번호로 단건 조회
  // ----------------------------------------------------------
  async searchByPhone(centerId: number, phone: string) {
    const member = await prisma.member.findFirst({
      where: { centerId, phone, deletedAt: null },
      include: { healthProfile: true },
    });

    if (!member) {
      throw new AppError(
        'MEMBER_NOT_FOUND',
        404,
        `해당 전화번호의 회원을 찾을 수 없습니다. (phone=${phone})`,
      );
    }

    return member;
  }
}

export const memberService = new MemberService();

/*
 * ============================================================
 * SMOKE TEST — Expected Input / Output
 * ============================================================
 *
 * [findAll]
 *   input : centerId=1, { page: 1, limit: 10, status: 'ACTIVE' }
 *   output: {
 *     items: [{ id: 1, name: '강민준', status: 'ACTIVE', healthProfile: {...}, insight: {...} }, ...],
 *     meta:  { total: 8, page: 1, limit: 10, totalPages: 1 }
 *   }
 *
 * [findById]
 *   input : id=1
 *   output: { id: 1, name: '강민준', phone: '010-3001-0001',
 *             healthProfile: { goal: '체지방 감량 및 근육 증가', caution: '...' },
 *             insight: { retentionIndex: 100, churnRiskScore: 0 } }
 *   throws: AppError(MEMBER_NOT_FOUND, 404) if id=9999
 *
 * [create]
 *   input : { centerId: 1, name: '홍길동', phone: '010-9999-0001', gender: 'M' }
 *   output: { id: 11, name: '홍길동', status: 'ACTIVE', ... }
 *   throws: AppError(MEMBER_PHONE_CONFLICT, 409) if phone already exists
 *
 * [update]
 *   input : id=1, { name: '강민준(수정)', status: 'STOP' }
 *   output: { id: 1, name: '강민준(수정)', status: 'STOP', ... }
 *   throws: AppError(MEMBER_NOT_FOUND, 404) if id=9999
 *
 * [softDelete]
 *   input : id=1
 *   output: { id: 1, deleted: true }
 *   throws: AppError(MEMBER_NOT_FOUND, 404) if id=9999
 *           AppError(MEMBER_ALREADY_DELETED, 409) if already deleted
 *
 * [searchByPhone]
 *   input : centerId=1, phone='010-3001-0001'
 *   output: { id: 1, name: '강민준', phone: '010-3001-0001', healthProfile: {...} }
 *   throws: AppError(MEMBER_NOT_FOUND, 404) if phone not found
 * ============================================================
 */
