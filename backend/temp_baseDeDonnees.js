"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connecterBaseDeDonnees = connecterBaseDeDonnees;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error']
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Fonction de connexion avec retry pour attendre que PostgreSQL soit prêt
async function connecterBaseDeDonnees(maxRetries = 10, delayMs = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await exports.prisma.$connect();
            console.log('✅ Connecté à PostgreSQL');
            return;
        }
        catch (error) {
            console.log(`⏳ Tentative ${i + 1}/${maxRetries} - PostgreSQL pas encore prêt...`);
            if (i === maxRetries - 1) {
                console.error('❌ Impossible de se connecter à PostgreSQL:', error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}
