import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fonction de connexion avec retry pour attendre que PostgreSQL soit prêt
export async function connecterBaseDeDonnees(maxRetries = 10, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Connecté à PostgreSQL');
      return;
    } catch (error) {
      console.log(`⏳ Tentative ${i + 1}/${maxRetries} - PostgreSQL pas encore prêt...`);
      if (i === maxRetries - 1) {
        console.error('❌ Impossible de se connecter à PostgreSQL:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
