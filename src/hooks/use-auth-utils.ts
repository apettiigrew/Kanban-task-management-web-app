"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

/**
 * Custom hook for authentication utilities
 * Provides easy access to session data and auth functions
 */
export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign out error:", error)
      // Fallback redirect
      router.push("/login")
    }
  }

  const handleSignIn = (callbackUrl?: string) => {
    const url = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"
    router.push(url)
  }

  return {
    user: session?.user || null,
    session,
    status,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    signOut: handleSignOut,
    signIn: handleSignIn,
  }
}
