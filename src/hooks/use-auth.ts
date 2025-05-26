"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: typeof signIn
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [router])

  const handleRefresh = useCallback(async () => {
    try {
      await update()
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [update])

  return {
    user: session?.user as AuthUser | null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    signIn,
    signOut: handleSignOut,
    refresh: handleRefresh,
  }
}
