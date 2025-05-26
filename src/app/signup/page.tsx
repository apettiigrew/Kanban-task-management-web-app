import Link from "next/link"
import SignupForm from "@/components/auth/signup-form"
import styles from "./page.module.scss"

export const metadata = {
  title: "Sign Up | Kanban App",
  description: "Create your Kanban App account",
}

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join Kanban App to start organizing your projects and tasks
          </p>
        </div>

        <div className={styles.formContainer}>
          <SignupForm />
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
