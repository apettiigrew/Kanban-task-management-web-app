import React from 'react';
import styles from './desktop-header.module.scss';
import { AppButtonWithIcon } from '../button/AppButton';
import { AddIcon } from '../icons/icons';
import { Heading } from '../heading/heading';

interface DesktopHeaderProps {
  onAddTask: () => void;
  onMenuClick?: () => void;
  title?: string;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onAddTask,
  onMenuClick,
  title = 'Platform Launch',
}) => {
  return (
    <header className={styles['desktop-header']}>
      <Heading>{title}</Heading>
      <div className={styles.actions}>
      <AppButtonWithIcon icon={<AddIcon />}>Add New Task</AppButtonWithIcon>
      
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <span className={styles.ellipsis}>⋮</span>
        </button>
      </div>
    </header>
  );
};
