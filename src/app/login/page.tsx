import Link from "next/link"
import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import styles from "./page.module.scss"

export const metadata = {
  title: "Sign In | Kanban App",
  description: "Sign in to your Kanban App account",
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to access your projects and tasks
          </p>
        </div>

        <div className={styles.formContainer}>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </p>
          <p className={styles.footerText}>
            <Link href="/reset-password" className={styles.link}>
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
