import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '@/app';
import prisma from '@/lib/prisma';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

describe('Payroll Logic Calculations Tests', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    await prisma.center.upsert({ where: { id: 1 }, create: { id: 1, name: 'Center' }, update: {} });
    
    // Inject active Tax mappings
    await prisma.taxRule.upsert({
      where: { year: 2026 },
      create: {
        year: 2026,
        nationalPension: 0.045,
        healthInsurance: 0.03545,
        longTermCareRate: 0.1295,
        employmentIns: 0.009,
        freelancerTax: 0.033,
      },
      update: {}
    });

    // Freelancer
    await prisma.staff.upsert({
      where: { id: 2 },
      create: { id: 2, name: 'Freelancer', role: 'TRAINER', centerId: 1, isFreelancer: true, baseSalary: 1000000 },
      update: { isFreelancer: true, baseSalary: 1000000 },
    });

    // Standard Employee
    await prisma.staff.upsert({
      where: { id: 3 },
      create: { id: 3, name: 'Employee', role: 'TRAINER', centerId: 1, isFreelancer: false, baseSalary: 1000000 },
      update: { isFreelancer: false, baseSalary: 1000000 },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Calculates strict 3.3% exclusions correctly mapping Freelancer flags', async () => {
    const response = await request(app.server)
      .post(`/api/v1/payrolls/calculate`)
      .send({ staffId: 2, targetMonth: '2026-05' });

    expect(response.status).toBe(201);
    
    const payroll = response.body;

    // Checks explicit logic branching
    expect(payroll.totalGrossPay).toBe(1000000);
    expect(payroll.nationalPension).toBe(0);
    expect(payroll.employmentIns).toBe(0);
    
    // 3.3% Check
    expect(payroll.incomeTax).toBe(33000);
    expect(payroll.localIncomeTax).toBe(3300);
    expect(payroll.finalNetPay).toBe(1000000 - 36300);
  });

  it('Calculates all standardized Insurance values explicitly parsing Standard Employee flags', async () => {
    const response = await request(app.server)
      .post(`/api/v1/payrolls/calculate`)
      .send({ staffId: 3, targetMonth: '2026-05' });

    expect(response.status).toBe(201);
    
    const payroll = response.body;

    // Verify standardized insurances dynamically calculate logic correctly
    expect(payroll.nationalPension).toBe(45000); // 1,000,000 * 0.045
    expect(payroll.healthInsurance).toBe(35450); // 1,000,000 * 0.03545
    expect(payroll.employmentIns).toBe(9000); // 1,000,000 * 0.009
    
    expect(payroll.incomeTax).toBe(0); // Standard employee assumptions (IRS mapped outside DB logic boundary)
  });
});
