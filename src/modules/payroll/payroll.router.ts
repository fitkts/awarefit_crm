import { FastifyPluginAsync } from 'fastify';
import { payrollService } from './payroll.service';
import { CalculatePayrollSchema, QueryPayrollSchema } from './payroll.schema';

const payrollRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/payrolls', async (request, reply) => {
    const query = QueryPayrollSchema.parse(request.query);
    const payrolls = await payrollService.findAll(query);
    return reply.send(payrolls);
  });

  fastify.post('/payrolls/calculate', async (request, reply) => {
    const { targetMonth } = CalculatePayrollSchema.parse(request.body);
    
    // In a real application, you might provide staffId individually or calculate all.
    // Assuming staffId is extracted from URL or request body payload extension:
    const { staffId } = request.body as { staffId: number };
    if (!staffId) {
       return reply.status(400).send({ error: 'staffId is required' });
    }

    const payroll = await payrollService.calculate(Number(staffId), targetMonth);
    return reply.status(201).send(payroll);
  });
};

export default payrollRoutes;
