"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signInSchema } from "@/lib/auth"
import styles from "./login-form.module.scss"

type FormData = z.infer<typeof signInSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target

    if (errors[name as keyof FormData]) {
      clearErrors(name as keyof FormData)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setSubmitError("Invalid email or password")
      } else if (result?.ok) {
        onSuccess?.()
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register("email")}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="Enter your email"
          required
          disabled={isLoading}
        />
        {errors.email && (
          <span className={styles.errorMessage}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
        {errors.password && (
          <span className={styles.errorMessage}>{errors.password.message}</span>
        )}
      </div>

      {submitError && (
        <div className={styles.submitError}>{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}
