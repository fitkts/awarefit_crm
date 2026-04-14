import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '@/app';
import prisma from '@/lib/prisma';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

describe('Subscription Module Integration Tests', () => {
  let productId: number;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Setup base resources required for mapping constraints
    await prisma.center.upsert({ where: { id: 1 }, create: { id: 1, name: 'Center' }, update: {} });
    await prisma.member.upsert({ where: { id: 1 }, create: { id: 1, name: 'Tester A', phone: '010-1111-3333', centerId: 1, status: 'ACTIVE' }, update: {} });
    await prisma.member.upsert({ where: { id: 2 }, create: { id: 2, name: 'Tester B', phone: '010-1111-4444', centerId: 1, status: 'ACTIVE' }, update: {} });
    await prisma.staff.upsert({ where: { id: 1 }, create: { id: 1, name: 'Staff A', role: 'TRAINER', centerId: 1 }, update: {} });
    const product = await prisma.product.create({ data: { name: 'PT 10', category: 'PT', price: 500000, sessionCnt: 10, validDays: 30, isActive: true } });
    productId = product.id;
  });

  afterAll(async () => {
    await app.close();
  });

  let createdSubId: number;

  it('Creates Subscription and associated Payment tightly mapped in single transaction', async () => {
    const response = await request(app.server)
      .post('/api/v1/subscriptions')
      .send({
        memberId: 1,
        staffId: 1,
        productId: productId,
        paymentAmount: 500000,
        paymentMethod: 'CARD',
      });

    expect(response.status).toBe(201);
    createdSubId = response.body.id;

    // Database verification
    const payments = await prisma.payment.findMany({
      where: { subId: createdSubId }
    });

    expect(payments).toHaveLength(1);
    expect(payments[0].amount).toBe(500000);
  });

  it('Transfers Subscription safely leaving tracking trails locally', async () => {
    const response = await request(app.server)
      .post(`/api/v1/subscriptions/${createdSubId}/transfer`)
      .send({
        toMemberId: 2,
        reason: 'Moving away',
      });

    expect(response.status).toBe(201);
    const newSubId = response.body.id;
    expect(newSubId).toBeGreaterThan(createdSubId);

    // Verify parent subscription mutated correctly
    const oldSub = await prisma.subscription.findUnique({
      where: { id: createdSubId }
    });

    expect(oldSub?.status).toBe('TRANSFERRED');

    // Verify TransferLog creation correctly
    const log = await prisma.transferLog.findFirst({
      where: { fromSubId: createdSubId }
    });

    expect(log).toBeDefined();
    expect(log?.toSubId).toBe(newSubId);
    expect(log?.reason).toBe('Moving away');
  });
});
