"use client"

import { useSignUp } from "@/hooks/use-signup";
import { authSchemas } from "@/utils/validation-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import styles from "./signup-form.module.scss";

// Define the form schema including confirmPassword for client-side validation
const formSchema = authSchemas.signUp.extend({
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine(
  (data: z.infer<typeof authSchemas.signUp> & { confirmPassword?: string }) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter();
  const { mutate: signUp, isPending: isLoading, error: submitError } = useSignUp();
  const { register, handleSubmit, formState: { errors }, } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = (data: FormData) => {
    const { ...signUpData } = data;
    signUp(signUpData, {
      onSuccess: () => {
        onSuccess?.();
        router.push("/login?message=Account created successfully. Please sign in.");
      },
      onError: (_error) => {
        // The error is already set in submitError by useSignUp
        console.error("Signup failed:", _error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.signupForm}>
      <div className={styles.formGroup}>
        <input
          type="text"
          id="name"
          {...register("name")}
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          placeholder="Enter your full name"
          disabled={isLoading}
        />
        {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <input
          type="email"
          id="email"
          {...register("email")}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="Enter your email"
          disabled={isLoading}
        />
        {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <input
          type="password"
          id="password"
          {...register("password")}
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          placeholder="Enter your password"
          disabled={isLoading}
        />
        {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <input
          type="password"
          id="confirmPassword"
          {...register("confirmPassword")}
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
          placeholder="Confirm your password"
          disabled={isLoading}
        />
        {errors.confirmPassword && <p className={styles.errorMessage}>{errors.confirmPassword.message}</p>}
      </div>

      {submitError && (
        <div className={styles.submitError}>
          {(submitError instanceof Error) ? submitError.message : "An unexpected error occurred. Please try again."}
        </div>
      )}
      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
