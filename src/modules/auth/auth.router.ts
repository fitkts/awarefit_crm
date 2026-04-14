import { FastifyPluginAsync } from 'fastify';
import { authService } from './auth.service';
import { LoginSchema, UpdatePasswordSchema } from './auth.schema';

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', async (request, reply) => {
    const dto = LoginSchema.parse(request.body);
    const user = await authService.authenticate(dto);

    // fastify-jwt is expected to be registered globally mapping sign() implicitly onto fastify bounds
    const token = app.jwt.sign({
      id: user.id,
      role: user.role,
      centerId: user.centerId,
    });

    return reply.status(200).send({
      message: 'Login successful',
      token,
      user,
    });
  });

  // Admin exclusive bounds or initial setups
  app.post('/set-password', async (request, reply) => {
    // Only logged in ADMINs can override passwords directly, or handled inside app logic constraints
    const dto = UpdatePasswordSchema.parse(request.body);
    const updatedStaff = await authService.setPassword(dto);
    
    return reply.status(200).send(updatedStaff);
  });
};

export default authRoutes;
