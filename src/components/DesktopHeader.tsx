import React from 'react';
import styles from './DesktopHeader.module.scss';
import Heading from './Heading';
import { AppButton, AppButtonWithIcon } from './AppButton';
import { AddIcon } from './AddIcon';

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
      <AppButtonWithIcon icon={<AddIcon />}>Add New Task</AppButtonWithIcon>
      
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <span className={styles.ellipsis}>⋮</span>
        </button>
      </div>
    </header>
  );
};

export default DesktopHeader; 