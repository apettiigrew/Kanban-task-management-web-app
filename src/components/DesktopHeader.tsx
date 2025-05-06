import React from 'react';
import styles from './DesktopHeader.module.scss';
import Heading from './Heading';
import { AppButton } from './AppButton';

interface DesktopHeaderProps {
  onAddTask: () => void;
  onMenuClick?: () => void;
  title?: string;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onAddTask,
  onMenuClick,
  title = 'Platform Launch',
}) => {
  return (
    <header className={styles['desktop-header']}>
      <Heading>{title}</Heading>
      <div className={styles.actions}>
        <AppButton onClick={onAddTask} className={styles.addTaskBtn}>
          + Add New Task
        </AppButton>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <span className={styles.ellipsis}>⋮</span>
        </button>
      </div>
    </header>
  );
};

export default DesktopHeader; 