import type { FastifyInstance } from 'fastify';
import { memberService } from './member.service';
import {
  CreateMemberSchema,
  UpdateMemberSchema,
  MemberQuerySchema,
  type CreateMemberDto,
  type UpdateMemberDto,
  type MemberQueryDto,
} from './member.schema';

// ============================================================
// Member Router (Fastify plugin)
// ============================================================
async function memberRoutes(app: FastifyInstance) {
  // ----------------------------------------------------------
  // GET /members — paginated list
  // ----------------------------------------------------------
  app.get<{ Querystring: MemberQueryDto & { centerId: string } }>(
    '/members',
    async (request, reply) => {
      const centerId = Number(request.query.centerId);
      const query = MemberQuerySchema.parse(request.query);
      const result = await memberService.findAll(centerId, query);
      return reply.send(result);
    },
  );

  // ----------------------------------------------------------
  // GET /members/:id — single member with healthProfile + insight
  // ----------------------------------------------------------
  app.get<{ Params: { id: string } }>('/members/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const member = await memberService.findById(id);
    return reply.send(member);
  });

  // ----------------------------------------------------------
  // POST /members — create member + healthProfile + insight
  // ----------------------------------------------------------
  app.post<{ Body: CreateMemberDto }>('/members', async (request, reply) => {
    const dto = CreateMemberSchema.parse(request.body);
    const member = await memberService.create(dto);
    return reply.status(201).send(member);
  });

  // ----------------------------------------------------------
  // PATCH /members/:id — partial update
  // ----------------------------------------------------------
  app.patch<{ Params: { id: string }; Body: UpdateMemberDto }>(
    '/members/:id',
    async (request, reply) => {
      const id = Number(request.params.id);
      const dto = UpdateMemberSchema.parse(request.body);
      const updated = await memberService.update(id, dto);
      return reply.send(updated);
    },
  );

  // ----------------------------------------------------------
  // DELETE /members/:id — soft delete
  // ----------------------------------------------------------
  app.delete<{ Params: { id: string } }>('/members/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const result = await memberService.softDelete(id);
    return reply.send(result);
  });
}

export default memberRoutes;
