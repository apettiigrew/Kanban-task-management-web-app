import React from 'react';
import styles from './AppButton.module.scss';

export type AppButtonVariant = 'primary' | 'secondary' | 'destructive';
export type AppButtonSize = 'large' | 'small';
export type AppButtonState = 'idle' | 'hover';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  state?: AppButtonState;
  children: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'large',
  state = 'idle',
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={[
        styles.button,
        styles[variant],
        styles[size],
        styles[state],
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};

interface AppButtonWithIconProps extends AppButtonProps {
  icon?: React.ReactNode;
}

export const AppButtonWithIcon: React.FC<AppButtonWithIconProps> = ({
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <AppButton {...props} className={className}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </AppButton>
  );
};


