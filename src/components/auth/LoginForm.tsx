'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/projects';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          User Name
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={styles.input}
          placeholder="username@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.input}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className={styles.checkboxGroup}>
        <div className={styles.rememberMe}>
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className={styles.checkbox}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className={styles.checkboxLabel}>
            Remember Me
          </label>
        </div>

        <Link href="/forgot-password" className={styles.forgotPassword}>
          Forgot Password?
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={isLoading} className={styles.button}>
        {isLoading ? 'Signing in...' : 'Login'}
      </button>

      <div className={styles.signupText}>
        New User?
        <Link href="/register" className={styles.signupLink}>
          Signup
        </Link>
      </div>
    </form>
  );
} 