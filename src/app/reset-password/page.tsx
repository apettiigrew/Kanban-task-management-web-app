import Link from "next/link"
import PasswordResetForm from "@/components/auth/password-reset-form"
import styles from "./page.module.scss"

export const metadata = {
  title: "Reset Password | Kanban App",
  description: "Reset your Kanban App password",
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            Enter your email address to receive a password reset link
          </p>
        </div>

        <div className={styles.formContainer}>
          <PasswordResetForm />
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Remember your password?{" "}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
