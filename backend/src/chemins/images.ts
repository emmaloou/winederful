import { Router, Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET } from '../config/s3';
import { asyncHandler } from '../middlewares/gestionErreurs';

const router = Router();

/**
 * GET /api/images?path=products/xxx/main.png
 * Sert les images depuis MinIO
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { path } = req.query;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ erreur: 'Paramètre path requis' });
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: path,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        return res.status(404).json({ erreur: 'Image non trouvée' });
      }

      // Convertir le stream en buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Définir les headers
      const contentType = response.ContentType || 'image/png';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return res.status(404).json({ erreur: 'Image non trouvée' });
      }
      throw error;
    }
  })
);

export default router;
