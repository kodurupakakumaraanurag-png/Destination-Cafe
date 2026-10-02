import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@destinationcafe.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        const defaultRoleMap: Record<string, UserRole> = {
          "admin@destinationcafe.com": UserRole.ADMIN,
          "manager@destinationcafe.com": UserRole.MANAGER,
          "sales@destinationcafe.com": UserRole.SALES,
          "analyst@destinationcafe.com": UserRole.ANALYST,
          "viewer@destinationcafe.com": UserRole.VIEWER,
        };
        const role = defaultRoleMap[email] || UserRole.VIEWER;

        try {
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            const roleRecord = await prisma.role.findUnique({ where: { name: role } });

            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0].toUpperCase() + " Demo User",
                userRole: role,
                roleId: roleRecord?.id,
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.userRole,
          };
        } catch {
          // Graceful DB offline fallback for demo authentication
          return {
            id: `demo-${email}`,
            name: email.split("@")[0].toUpperCase() + " Demo User",
            email,
            role,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "destination-cafe-enterprise-secret-key-12345",
};

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}
