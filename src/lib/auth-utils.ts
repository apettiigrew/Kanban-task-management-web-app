import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

/**
 * Higher-order function to protect API routes
 * Returns the authenticated user if valid session exists, otherwise returns error response
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, session: unknown, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await auth()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        )
      }

      return handler(request, session, ...args)
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }
  }
}

/**
 * Utility function to get authenticated user from session
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("Failed to get authenticated user:", error)
    return null
  }
}

/**
 * Utility function to require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  
  if (!user?.id) {
    throw new Error("Authentication required")
    
  }
  
  return user as { id: string; email: string; name?: string }
}
