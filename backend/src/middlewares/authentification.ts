import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './gestionErreurs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Middleware pour vérifier le JWT et protéger les routes
 * Usage: app.get('/api/protegee', requireAuth, controleur)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Token manquant - Veuillez vous connecter');
    }

    // 2. Extraire le token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // 4. Attacher l'utilisateur à la requête
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Token invalide');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expiré - Veuillez vous reconnecter');
    }
    throw error;
  }
};

/**
 * Middleware optionnel qui attache l'utilisateur s'il est connecté,
 * mais laisse passer si non authentifié
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    (req as any).user = decoded;

    next();
  } catch (error) {
    // Ignore les erreurs, utilisateur simplement non authentifié
    next();
  }
};
