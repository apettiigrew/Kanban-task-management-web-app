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

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Function to verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

// Export validation schemas for use in components
export { hashPassword, signInSchema, signUpSchema, verifyPassword }

