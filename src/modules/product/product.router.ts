import { FastifyPluginAsync } from 'fastify';
import { productService } from './product.service';
import {
  CreateProductSchema,
  UpdateProductSchema,
  QueryProductSchema,
} from './product.schema';

const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/products', async (request, reply) => {
    const query = QueryProductSchema.parse(request.query);
    const products = await productService.findAll(query);
    return reply.send(products);
  });

  fastify.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await productService.findById(Number(id));
    return reply.send(product);
  });

  fastify.post('/products', async (request, reply) => {
    const dto = CreateProductSchema.parse(request.body);
    const product = await productService.create(dto);
    return reply.status(201).send(product);
  });

  fastify.patch('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = UpdateProductSchema.parse(request.body);
    const product = await productService.update(Number(id), dto);
    return reply.send(product);
  });

  fastify.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await productService.softDelete(Number(id));
    return reply.status(204).send();
  });
};

export default productRoutes;
