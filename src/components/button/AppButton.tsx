import React from 'react';
import styles from './AppButton.module.scss';
import { cc } from '@/utils/style-utils';

export type AppButtonVariant = 'primary' | 'secondary' | 'destructive' | 'actionButton';
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

// New component for "Add a card" button
interface AddCardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const AddCardButton: React.FC<AddCardButtonProps> = ({
  children,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.addCardButton} ${className}`}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export function AppButtonWithIconSquared({
  children,
  icon,
  className = '',
  ...props
}: AddCardButtonProps) {
  
  const cn = cc(styles.button,styles.actionButton, className);

  return (
    <button
      className={cn}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function CloseButton(props: CloseButtonProps) {
  const { icon, className = '', ...rest } = props;
  return (
    <button
      className={`${styles.closeButton} ${className}`.trim()}
      type="button"
      aria-label="Cancel"
      {...rest}
    >
      {icon}
    </button>
  );
}


