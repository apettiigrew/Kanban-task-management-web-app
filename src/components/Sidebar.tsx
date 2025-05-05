import React from 'react';
import styles from './Sidebar.module.scss';

const boards = [
  { name: 'Platform Launch', active: true },
  { name: 'Marketing Plan', active: false },
  { name: 'Roadmap', active: false },
];

const Sidebar: React.FC = () => {
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
          <li className={styles.createBoard}>
            <span className={styles.boardIcon}>＋</span>
            + Create New Board
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
        <button className={styles.hideSidebar}>
          <span role="img" aria-label="hide">👁️‍🗨️</span> Hide Sidebar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 