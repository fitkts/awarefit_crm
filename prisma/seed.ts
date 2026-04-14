import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // 1. Center
  // ============================================================
  const center = await prisma.center.create({
    data: {
      name: '에이웨어핏 강남점',
      phone: '02-555-1234',
      address: '서울특별시 강남구 테헤란로 123, 3층',
      timezone: 'Asia/Seoul',
    },
  });
  console.log(`✅ Center created: ${center.name} (id=${center.id})`);

  // ============================================================
  // 2. Staff (1 ADMIN + 2 TRAINER)
  // ============================================================
  const admin = await prisma.staff.create({
    data: {
      centerId: center.id,
      name: '김대표',
      role: 'ADMIN',
      phone: '010-1000-0001',
      email: 'admin@awarefit.kr',
      baseSalary: 4_000_000,
      isFreelancer: false,
      hireDate: new Date('2023-01-02'),
    },
  });

  const trainer1 = await prisma.staff.create({
    data: {
      centerId: center.id,
      name: '이트레이너',
      role: 'TRAINER',
      phone: '010-2000-0001',
      email: 'trainer1@awarefit.kr',
      baseSalary: 2_500_000,
      isFreelancer: false,
      hireDate: new Date('2023-03-15'),
    },
  });

  const trainer2 = await prisma.staff.create({
    data: {
      centerId: center.id,
      name: '박필라',
      role: 'TRAINER',
      phone: '010-2000-0002',
      email: 'trainer2@awarefit.kr',
      baseSalary: 0,
      isFreelancer: true,
      hireDate: new Date('2024-01-08'),
    },
  });

  console.log(`✅ Staff created: ${admin.name}, ${trainer1.name}, ${trainer2.name}`);

  // ============================================================
  // 3. Products (PT × 3, MEMBERSHIP × 1, PILATES × 1)
  // ============================================================
  const [ptBasic, ptStandard, ptPremium, membershipMonthly, pilatesGroup] =
    await Promise.all([
      prisma.product.create({
        data: {
          name: 'PT 베이직 10회',
          category: 'PT',
          price: 500_000,
          sessionCnt: 10,
          validDays: 90,
        },
      }),
      prisma.product.create({
        data: {
          name: 'PT 스탠다드 20회',
          category: 'PT',
          price: 900_000,
          sessionCnt: 20,
          validDays: 180,
        },
      }),
      prisma.product.create({
        data: {
          name: 'PT 프리미엄 30회',
          category: 'PT',
          price: 1_200_000,
          sessionCnt: 30,
          validDays: 365,
        },
      }),
      prisma.product.create({
        data: {
          name: '헬스 월 이용권',
          category: 'MEMBERSHIP',
          price: 80_000,
          sessionCnt: -1,
          validDays: 30,
        },
      }),
      prisma.product.create({
        data: {
          name: '필라테스 그룹 10회',
          category: 'PILATES',
          price: 350_000,
          sessionCnt: 10,
          validDays: 60,
        },
      }),
    ]);

  console.log(`✅ Products created: 5개`);

  // ============================================================
  // 4. TaxRule (2025, 2026)
  // ============================================================
  await prisma.taxRule.createMany({
    data: [
      {
        year: 2025,
        nationalPension: 0.045,
        healthInsurance: 0.03545,
        longTermCareRate: 0.1295,
        employmentIns: 0.009,
        freelancerTax: 0.033,
      },
      {
        year: 2026,
        nationalPension: 0.045,
        healthInsurance: 0.03545,
        longTermCareRate: 0.1295,
        employmentIns: 0.009,
        freelancerTax: 0.033,
      },
    ],
  });
  console.log(`✅ TaxRule created: 2025, 2026`);

  // ============================================================
  // 5. CommissionRule — 트레이너 2명 각 PER_SESSION
  // ============================================================
  await prisma.commissionRule.createMany({
    data: [
      {
        staffId: trainer1.id,
        type: 'PER_SESSION',
        minSessions: 0,
        maxSessions: 9999,
        rate: 25000, // 회당 25,000원
        effectiveFrom: new Date('2023-03-15'),
      },
      {
        staffId: trainer2.id,
        type: 'PER_SESSION',
        minSessions: 0,
        maxSessions: 9999,
        rate: 22000, // 회당 22,000원 (프리랜서)
        effectiveFrom: new Date('2024-01-08'),
      },
    ],
  });
  console.log(`✅ CommissionRule created: trainer1, trainer2`);

  // ============================================================
  // 6. Members × 10 + HealthProfile × 10
  // ============================================================
  const membersData = [
    {
      name: '강민준',
      phone: '010-3001-0001',
      email: 'minjun@example.com',
      gender: 'M',
      birth: new Date('1992-05-12'),
      status: 'ACTIVE',
      health: {
        goal: '체지방 감량 및 근육 증가',
        caution: '오른쪽 어깨 회전근개 부분 파열 이력',
      },
    },
    {
      name: '이지영',
      phone: '010-3001-0002',
      email: 'jiyoung@example.com',
      gender: 'F',
      birth: new Date('1995-08-22'),
      status: 'ACTIVE',
      health: {
        goal: '산후 체형 교정 및 코어 강화',
        caution: '출산 후 6개월, 허리 통증 주의',
      },
    },
    {
      name: '박성현',
      phone: '010-3001-0003',
      email: 'sunghyun@example.com',
      gender: 'M',
      birth: new Date('1988-11-03'),
      status: 'ACTIVE',
      health: {
        goal: '10kg 증량 및 체력 강화',
        caution: '없음',
      },
    },
    {
      name: '최유리',
      phone: '010-3001-0004',
      email: 'yuri@example.com',
      gender: 'F',
      birth: new Date('1998-02-17'),
      status: 'ACTIVE',
      health: {
        goal: '바디 라인 개선, 힙업',
        caution: '무릎 반월판 연골 손상 이력',
      },
    },
    {
      name: '한동훈',
      phone: '010-3001-0005',
      email: 'donghoon@example.com',
      gender: 'M',
      birth: new Date('1985-07-29'),
      status: 'ACTIVE',
      health: {
        goal: '당뇨 관리를 위한 유산소+근력 병행',
        caution: '혈당 수치 체크 필수, 저혈당 주의',
      },
    },
    {
      name: '정수빈',
      phone: '010-3001-0006',
      email: 'subin@example.com',
      gender: 'F',
      birth: new Date('2000-01-14'),
      status: 'ACTIVE',
      health: {
        goal: '자세 교정 (거북목, 라운드숄더)',
        caution: '없음',
      },
    },
    {
      name: '윤기태',
      phone: '010-3001-0007',
      email: 'gitae@example.com',
      gender: 'M',
      birth: new Date('1990-04-06'),
      status: 'STOP',
      health: {
        goal: '마라톤 완주를 위한 체력 강화',
        caution: '발바닥 족저근막염',
      },
    },
    {
      name: '송미래',
      phone: '010-3001-0008',
      email: 'mirae@example.com',
      gender: 'F',
      birth: new Date('1993-09-30'),
      status: 'EXPIRED',
      health: {
        goal: '스트레스 해소 및 전반적 체력 향상',
        caution: '없음',
      },
    },
    {
      name: '임재원',
      phone: '010-3001-0009',
      email: 'jaewon@example.com',
      gender: 'M',
      birth: new Date('1996-12-25'),
      status: 'ACTIVE',
      health: {
        goal: '보디빌딩 대회 준비',
        caution: '없음',
      },
    },
    {
      name: '오하은',
      phone: '010-3001-0010',
      email: 'haeun@example.com',
      gender: 'F',
      birth: new Date('2002-03-08'),
      status: 'ACTIVE',
      health: {
        goal: '근력 기초 강화 및 자신감 향상',
        injuries: '없음',
        caution: '첫 운동 경험, 강도 조절 필요',
      },
    },
  ];

  for (const m of membersData) {
    const member = await prisma.member.create({
      data: {
        centerId: center.id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        birth: m.birth,
        status: m.status,
      },
    });

    await prisma.healthProfile.create({
      data: {
        memberId: member.id,
        injuries: (m.health as { injuries?: string }).injuries,
        goal: m.health.goal,
        caution: m.health.caution,
      },
    });

    console.log(`  👤 Member created: ${member.name} (${member.status})`);
  }

  console.log(`✅ Members + HealthProfiles created: 10개`);
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
