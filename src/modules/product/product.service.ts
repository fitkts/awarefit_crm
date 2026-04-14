import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './product.schema';

export class ProductService {
  async findAll(query?: QueryProductDto) {
    return await prisma.product.findMany({
      where: {
        deletedAt: null,
        category: query?.category,
        isActive: query?.isActive,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    return await prisma.product.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findById(id);

    return await prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    await this.findById(id);

    return await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

export const productService = new ProductService();
