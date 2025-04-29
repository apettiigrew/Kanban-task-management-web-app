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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 