import React from 'react';
import styles from './Column.module.scss';

interface ColumnWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

export function ColumnWrapper(props: ColumnWrapperProps) {
  const { children, className = '', style, ref } = props;

  return (
    <div className={`${styles.column} ${className}`} style={style} ref={ref}>
      {children}
    </div>
  );
};
