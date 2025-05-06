import React from 'react';
import styles from './heading.module.scss';

interface HeadingProps {
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ children }) => {
  return <h2 className={styles.heading}>{children}</h2>;
};
