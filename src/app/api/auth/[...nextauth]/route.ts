
import { verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/database';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface Credentials {
  email: string;
  password: string;
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Credentials | undefined) {
        try {
          console.log("Authorizing user with credentials:", credentials);
          if (!credentials) {
            throw new Error("No credentials provided")
          }

          if (!credentials.email || !credentials.password) {
            throw new Error("All credentials must be provided")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              hashedPassword: true,
            },
          })

          if (!user) {
            throw new Error("Credentials are invalid")
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, user.hashedPassword!)

          if (!isValidPassword) {
            throw new Error("Credentials are invalid")
          }

          // Return user object without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
