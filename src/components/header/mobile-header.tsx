import React from 'react';
import styles from './mobile-header.module.scss';
import { AddIcon } from '../icons/icons';

export const MobileHeader: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {

  
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.bars}>
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </span>
      </div>
      <div className={styles.center}>
        <span className={styles.title}>Platform Launch</span>
        <span className={styles.arrow}>&#9660;</span>
      </div>
      <div className={styles.right}>
        <button className={styles.iconButton} onClick={onAddClick}>
          <AddIcon />
        </button>
        <button className={styles.iconButton}>
          <span className={styles.ellipsis}>⋮</span>
        </button>
      </div>
    </header>
  );
};