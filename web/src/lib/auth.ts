import NextAuth, { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        return ok ? { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined } : null;
      }
    })
  ],
  pages: {},
  secret: process.env.NEXTAUTH_SECRET
};

export const { auth } = NextAuth(authOptions);


