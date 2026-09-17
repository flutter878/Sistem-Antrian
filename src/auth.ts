import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 jam (habis setelah jam kerja)
  pages: {
    signIn: "/login",
  },
  providers: [
    // ── Staf (Admin, Petugas, Satpam) ────────────────────────────
    Credentials({
      id: "staf",
      name: "Staf",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user || !user.aktif) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.nama,
          email: user.username, // pakai username sebagai identifier
          role: user.role,
          loket: user.loket ?? undefined,
        };
      },
    }),

    // ── Pemohon (NIK + password) ──────────────────────────────────
    Credentials({
      id: "pemohon",
      name: "Pemohon",
      credentials: {
        nik: { label: "NIK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nik || !credentials?.password) return null;

        const pemohon = await prisma.pemohon.findUnique({
          where: { nik: credentials.nik as string },
        });

        if (!pemohon || !pemohon.aktif) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          pemohon.passwordHash
        );
        if (!valid) return null;

        return {
          id: String(pemohon.id),
          name: pemohon.nama,
          email: pemohon.nik, // pakai NIK sebagai identifier
          role: "pemohon" as const,
          nik: pemohon.nik,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.loket = (user as { loket?: string }).loket;
        token.nik = (user as { nik?: string }).nik;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.loket = token.loket as string | undefined;
        session.user.nik = token.nik as string | undefined;
      }
      return session;
    },
  },
});
