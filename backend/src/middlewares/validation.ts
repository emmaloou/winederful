import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from './gestionErreurs';

export const valider = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(400, error.errors.map(e => e.message).join(', '));
      }
      next(error);
    }
  };
};

// Schémas de validation
export const schemas = {
  register: z.object({
    email: z.string().email('Format email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    name: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Format email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
};
