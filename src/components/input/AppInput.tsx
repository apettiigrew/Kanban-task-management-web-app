import React from 'react';
import styles from './AppInput.module.scss';

interface AppInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  wrapperClassName?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      value,
      onChange,
      placeholder = '',
      className = '',
      id = 'input',
      wrapperClassName = '',
      onBlur,
      onKeyDown,
    },
    ref
  ) => {
    return (
      <div
        className={`${styles.appInputWrapper} ${wrapperClassName || ''}`.trim()}
      >
        <input
          ref={ref}
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? ""}
          className={`${styles.appInput} ${className || ''}`.trim()}
          aria-label={placeholder}
          autoComplete="off"
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  }
);
AppInput.displayName = 'AppInput';