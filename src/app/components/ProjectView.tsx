'use client';

import styles from './ProjectView.module.css';

export default function ProjectView() {
  const projects = []; // This will later be replaced with actual project data

  return (
    <div className={styles.projectView}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Projects</h1>
        <button className={styles.createButton}>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={styles.plusIcon}
          >
            <path 
              d="M7.368 12V7.344H12V4.632H7.368V0H4.656V4.632H0V7.344H4.656V12H7.368Z" 
              fill="currentColor"
            />
          </svg>
          Create Project
        </button>
      </header>

      <main className={styles.content}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No projects yet</h2>
            <p className={styles.emptyText}>Create your first project to get started</p>
            <button className={styles.createButton}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.plusIcon}
              >
                <path 
                  d="M7.368 12V7.344H12V4.632H7.368V0H4.656V4.632H0V7.344H4.656V12H7.368Z" 
                  fill="currentColor"
                />
              </svg>
              Create Project
            </button>
          </div>
        ) : (
          // Project list will be implemented here later
          null
        )}
      </main>
    </div>
  );
} 