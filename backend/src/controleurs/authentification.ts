import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/baseDeDonnees';
import { ApiError, asyncHandler } from '../middlewares/gestionErreurs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = '7d';

export const inscription = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) throw new ApiError(409, 'Email déjà enregistré');

  const motDePasseHache = await bcrypt.hash(password, 12);
  const utilisateur = await prisma.user.create({
    data: { email, password: motDePasseHache, name: name || null },
    select: { id: true, email: true, name: true }
  });

  const token = jwt.sign({ userId: utilisateur.id, email: utilisateur.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ donnees: { utilisateur, token }, message: 'Utilisateur créé' });
});

export const connexion = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const utilisateur = await prisma.user.findUnique({ where: { email } });
  if (!utilisateur || !utilisateur.password) throw new ApiError(401, 'Identifiants invalides');

  const valide = await bcrypt.compare(password, utilisateur.password);
  if (!valide) throw new ApiError(401, 'Identifiants invalides');

  const token = jwt.sign({ userId: utilisateur.id, email: utilisateur.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ donnees: { utilisateur: { id: utilisateur.id, email: utilisateur.email, name: utilisateur.name }, token }, message: 'Connexion réussie' });
});

export const obtenirProfil = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) throw new ApiError(401, 'Non authentifié');

  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true }
  });

  if (!utilisateur) throw new ApiError(404, 'Utilisateur non trouvé');
  res.json({ donnees: utilisateur });
});
