"use client"

import { useState } from "react"
import { z } from "zod"
import styles from "./password-reset-form.module.scss"

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type FormData = z.infer<typeof resetSchema>

interface PasswordResetFormProps {
  onSuccess?: () => void
}

export default function PasswordResetForm({ onSuccess }: PasswordResetFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    try {
      resetSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<FormData> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setSubmitError(result.error || "Failed to send reset email")
        return
      }

      setIsSubmitted(true)
      onSuccess?.()
    } catch (error) {
      console.error("Password reset error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={styles.successMessage}>
        <h3>Check your email</h3>
        <p>
          We've sent a password reset link to <strong>{formData.email}</strong>.
          Please check your email and follow the instructions to reset your password.
        </p>
        <p className={styles.note}>
          If you don't see the email, check your spam folder or try again.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.resetForm}>
      <div className={styles.description}>
        <p>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="Enter your email address"
          required
          disabled={isLoading}
        />
        {errors.email && (
          <span className={styles.errorMessage}>{errors.email}</span>
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
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  )
}
