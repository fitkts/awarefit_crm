import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '@/app';
import prisma from '@/lib/prisma';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

describe('Member Module Integration Tests', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Creating a member triggers HealthProfile and MemberInsight generation', async () => {
    const memberPayload = {
      name: 'Integration Tester',
      phone: '010-1111-2222',
      birth: '1990-01-01',
      gender: 'M',
      centerId: 1, // Assume generic static testing maps correctly in isolated context
    };

    // Assuming center needs to exist natively
    await prisma.center.upsert({
      where: { id: 1 },
      create: { id: 1, name: 'Test Center' },
      update: {},
    });

    const response = await request(app.server)
      .post('/api/v1/members')
      .send(memberPayload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    const createdMemberId = response.body.id;

    // Direct Database DB checks verifying auto-created entities inside `member.service.ts` transaction
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { memberId: createdMemberId }
    });

    const insight = await prisma.memberInsight.findUnique({
       where: { memberId: createdMemberId }
    });

    expect(healthProfile).not.toBeNull();
    expect(insight).not.toBeNull();
    
    // Validate default settings
    expect(insight?.attendanceScore).toBe(100);
    expect(insight?.sentimentScore).toBe(100);
  });
});
