import React from 'react';
import styles from './sidebar.module.scss';
import { AddIcon, EyeIcon } from '../icons/icons';
import { AppButtonWithIcon } from '../button/AppButton';


const boards = [
  { name: 'Platform Launch', active: true },
  { name: 'Marketing Plan', active: false },
  { name: 'Roadmap', active: false },
];


interface SidebarProps {
  collapsed: boolean;
  onShowSidebar: () => void;
  onHideSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onShowSidebar, onHideSidebar }) => {
  if (collapsed) {
    return (
      <button className={styles.showSidebar} onClick={onShowSidebar}>
        <EyeIcon />
      </button>
    );
  }
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.bars}>
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </span>
        <span className={styles.appName}>kanban</span>
      </div>
      <div className={styles.boardsSection}>
        <div className={styles.boardsLabel}>ALL BOARDS (3)</div>
        <ul className={styles.boardList}>
          {boards.map((board) => (
            <li
              key={board.name}
              className={board.active ? styles.activeBoard : styles.board}
            >
              <span className={styles.boardIcon}>▦</span>
              {board.name}
            </li>
          ))}
          <li>
          <AppButtonWithIcon icon={<AddIcon />}>Create New Board</AppButtonWithIcon>
          </li>
        </ul>
      </div>
      <div className={styles.bottomSection}>
        <div className={styles.themeToggle}>
          <span role="img" aria-label="light">🌞</span>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span role="img" aria-label="dark">🌜</span>
        </div>
        <button className={styles.hideSidebar} onClick={onHideSidebar}>
          <span role="img" aria-label="hide">👁️‍🗨️</span> Hide Sidebar
        </button>
      </div>
    </aside>
  );
};