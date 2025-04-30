'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './app-button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
}

export default function AppButton({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {isLoading ? (
        <span className={styles.loadingSpinner}>
          <svg className={styles.spinner} viewBox="0 0 50 50">
            <circle
              className={styles.spinnerPath}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            />
          </svg>
        </span>
      ) : children}
    </button>
  );
} 