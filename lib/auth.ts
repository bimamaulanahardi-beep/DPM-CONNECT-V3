import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        nim: { label: 'NIM', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.nim || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { nim: credentials.nim },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          nim: user.nim,
          komisi: user.komisi,
          jabatan: user.jabatan,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.nim = (user as any).nim;
        token.komisi = (user as any).komisi;
        token.jabatan = (user as any).jabatan;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).nim = token.nim;
        (session.user as any).komisi = token.komisi;
        (session.user as any).jabatan = token.jabatan;
        (session.user as any).id = token.sub;
        (session.user as any).phone = token.phone;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

