import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = signInSchema.parse(credentials)

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              hashedPassword: true,
            },
          })

          if (!user || !user.hashedPassword) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.hashedPassword)
          
          if (!isValidPassword) {
            return null
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
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Helper functions for authentication actions
export async function createUser(userData: z.infer<typeof signUpSchema>) {
  try {
    // Validate input
    const { email, password, name } = signUpSchema.parse(userData)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return { user, error: null }
  } catch (error) {
    console.error("User creation error:", error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : "Failed to create user" 
    }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
    return user
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

export async function updateUserPassword(email: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const user = await prisma.user.update({
      where: { email },
      data: { hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
    
    return { user, error: null }
  } catch (error) {
    console.error("Password update error:", error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : "Failed to update password" 
    }
  }
}

// Export validation schemas for use in components
export { signInSchema, signUpSchema }
