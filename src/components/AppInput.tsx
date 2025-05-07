import React from 'react';

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
    <div className={wrapperClassName} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        aria-label={placeholder}
        autoComplete="off"
        style={icon ? { paddingRight: 38 } : {}}
      />
      {icon && (
        <span style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#bfc4d1',
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </span>
      )}
    </div>
  );
}; 