import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Login | Kanban App',
  description: 'Login to your Kanban board account',
};

export default function LoginPage() {
  return (
    <div className={styles.container}>
      {/* Left side with gradient background */}
      <div className={styles.leftSide}>
        <div className={styles.gradientBg} />
        <div className={styles.gradientShape} />
        <h1 className={styles.welcomeText}>Welcome Back!</h1>
      </div>

      {/* Right side with login form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>Login</h2>
            <p className={styles.subtitle}>
              Welcome back! Please login to your account.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 