'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import { useActionState, useEffect } from 'react';
import { registerUser } from '@/features/register/actions/actions';

const initialState = {
  errors: {},
  message: '',
};

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.message === 'Registration successful!') {
      router.push('/login');
    }
  }, [state.message, router]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <h1 className={styles.title}>
            Visualize Work.<br />
            Maximize Flow.
          </h1>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>|||</div>
              <div className={styles.featureContent}>
                <h3>Intuitive Task Management</h3>
                <p>Organize your work with our flexible kanban boards. Drag and drop tasks, set priorities, and track progress with ease.</p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
                  <rect width="20" height="16" x="2" y="4" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" d="M8 10h8M8 14h4"/>
                </svg>
              </div>
              <div className={styles.featureContent}>
                <h3>Team Collaboration</h3>
                <p>Work together seamlessly with real-time updates, task assignments, and progress tracking. Keep everyone aligned and moving forward.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Create an account.</h2>
            <p className={styles.formSubtitle}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>

            <form action={formAction} className={styles.form}>
              {state.errors?._form && (
                <div className={styles.formError}>
                  {state.errors._form.map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              )}

              <div className={styles.nameFields}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    className={`${styles.input} ${state.errors?.firstName ? styles.inputError : ''}`}
                    required
                  />
                  {state.errors?.firstName && (
                    <span className={styles.errorText}>{state.errors.firstName[0]}</span>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className={`${styles.input} ${state.errors?.lastName ? styles.inputError : ''}`}
                    required
                  />
                  {state.errors?.lastName && (
                    <span className={styles.errorText}>{state.errors.lastName[0]}</span>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`${styles.input} ${state.errors?.email ? styles.inputError : ''}`}
                  required
                />
                {state.errors?.email && (
                  <span className={styles.errorText}>{state.errors.email[0]}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`${styles.input} ${state.errors?.password ? styles.inputError : ''}`}
                  required
                />
                {state.errors?.password && (
                  <span className={styles.errorText}>{state.errors.password[0]}</span>
                )}
              </div>

              <button type="submit" className={styles.submitButton}>
                Sign Up
              </button>

              <div className={styles.divider}>
                <span>or sign up with</span>
              </div>

              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.githubIcon}>
                    <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                  </svg>
                  GitHub
                </button>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                    <path fill="currentColor" d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
                    <path fill="white" d="M12 4.8c2.97 0 4.947 1.29 6.084 2.367l4.068-3.972C19.752 1.2 16.212 0 12 0 7.395 0 3.444 2.715 1.353 6.723l4.728 3.667C7.128 6.675 9.372 4.8 12 4.8z"/>
                    <path fill="white" d="M23.76 12.225c0-.938-.084-1.838-.24-2.7H12v5.1h6.615c-.285 1.537-1.155 2.838-2.46 3.705l4.755 3.683c2.78-2.565 4.38-6.345 4.38-10.605z"/>
                    <path fill="white" d="M5.595 14.337c-.308-.915-.484-1.89-.484-2.902 0-1.013.176-1.988.483-2.903L.867 4.865C.312 6.455 0 8.19 0 10c0 1.81.312 3.545.867 5.135l4.728-3.667z"/>
                    <path fill="white" d="M12 24c3.24 0 5.95-1.073 7.932-2.903l-4.755-3.683c-1.32.885-3.015 1.41-4.823 1.41-3.273 0-6.045-2.208-7.028-5.175L.867 15.135C2.958 20.283 7.395 24 12 24z"/>
                  </svg>
                  Google
                </button>
              </div>

              <p className={styles.terms}>
                By signing up you agree to our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 