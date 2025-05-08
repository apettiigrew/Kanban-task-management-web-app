import React from 'react';
import styles from './AppInput.module.scss';

interface AppInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

export const AppInput: React.FC<AppInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  id = 'input',
  wrapperClassName = '',
  icon,
}) => {
  
  return (
    <div
      className={`${styles.appInputWrapper} ${wrapperClassName || ''}`.trim()}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        className={`${styles.appInput} ${className || ''}`.trim()}
        aria-label={placeholder}
        autoComplete="off"
      />
    </div>
  );
}; 