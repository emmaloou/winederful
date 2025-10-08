import { Request, Response } from 'express';
import { prisma } from '../config/baseDeDonnees';
import { redis, CACHE_TTL } from '../config/cache';
import { ApiError, asyncHandler } from '../middlewares/gestionErreurs';

export const obtenirProduits = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const offset = (page - 1) * limit;

  const cacheKey = `produits:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json({ ...JSON.parse(cached), enCache: true });
  }

  const [produits, total] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, reference: true, name: true, color: true, vintage: true, priceEur: true, producer: true, stockQuantity: true, rating: true, region: true, images: { select: { objectKey: true }, take: 1 } },
      where: { stockQuantity: { gt: 0 } },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where: { stockQuantity: { gt: 0 } } })
  ]);

  const reponse = {
    donnees: produits,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };

  await redis.setex(cacheKey, CACHE_TTL.PRODUCTS, JSON.stringify(reponse));
  res.json({ ...reponse, enCache: false });
});

export const obtenirProduitParId = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `produit:${id}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json({ donnees: JSON.parse(cached), enCache: true });
  }

  const produit = await prisma.product.findUnique({ where: { id }, include: { images: true } });

  if (!produit) {
    throw new ApiError(404, 'Produit non trouvé');
  }

  await redis.setex(cacheKey, CACHE_TTL.PRODUCT_DETAIL, JSON.stringify(produit));
  res.json({ donnees: produit, enCache: false });
});
