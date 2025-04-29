'use client';

import styles from './Board.module.css';

export default function Board() {
  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <h1 className={styles.title}>Platform Launch</h1>
        <div className={styles.actions}>
          <button className={styles.addTaskButton}>
            + Add New Task
          </button>
          <button className={styles.menuButton}>
            <svg width="5" height="20" xmlns="http://www.w3.org/2000/svg">
              <g fill="#828FA3" fillRule="evenodd">
                <circle cx="2.308" cy="2.308" r="2.308"/>
                <circle cx="2.308" cy="10" r="2.308"/>
                <circle cx="2.308" cy="17.692" r="2.308"/>
              </g>
            </svg>
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.emptyState}>
          <p>This board is empty. Create a new column to get started.</p>
          <button className={styles.addColumnButton}>
            + Add New Column
          </button>
        </div>
      </main>
    </div>
  );
} 