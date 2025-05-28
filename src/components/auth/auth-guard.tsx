"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import styles from "./auth-guard.module.scss"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Client-side authentication guard component
 * Redirects to login if user is not authenticated
 * Use this for pages that need additional client-side auth protection
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      // Redirect to login with current page as callback
      const currentPath = window.location.pathname
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }
  }, [session, status, router])

  // Show loading state
  if (status === "loading") {
    return (
      fallback || (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Don't render children if not authenticated
  if (!session) {
    return null
  }

  // Render children if authenticated
  return <>{children}</>
}
