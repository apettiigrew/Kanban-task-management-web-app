import React, { useState } from 'react';
import styles from './sidebar.module.scss';
import { AddIcon, EyeIcon } from '../icons/icons';
import { AppButtonWithIcon } from '../button/AppButton';
import { AddProjectModal } from '../modals/add-project-modal';
import { useProjects, Project } from '@/hooks/useProjects';

interface SidebarProps {
  collapsed: boolean;
  onShowSidebar: () => void;
  onHideSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onShowSidebar, onHideSidebar }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  
  // Use TanStack Query to fetch projects
  const { data: projects, isLoading, isError, refetch } = useProjects();

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  
  const handleProjectClick = (projectId: number) => {
    setActiveProjectId(projectId);
  };

  if (collapsed) {
    return (
      <button className={styles.showSidebar} onClick={onShowSidebar}>
        <EyeIcon />
      </button>
    );
  }
  return (
    <>
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
          <div className={styles.boardsLabel}>
            <p>ALL BOARDS ({isLoading ? '...' : projects?.length || 0})</p>
          </div>
          <div className={styles.projectsContainer}>
            <ul className={styles.boardList}>
              {isLoading ? (
                <li className={styles.loadingItem}>Loading projects...</li>
              ) : isError ? (
                <li className={styles.errorItem}>Failed to load projects</li>
              ) : projects?.length ? (
                projects.map((project) => (
                  <li 
                    key={project.id} 
                    className={`${styles.projectItem} ${project.id === activeProjectId ? styles.active : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <span className={styles.projectIcon}>📋</span>
                    {project.title}
                  </li>
                ))
              ) : (
                <li className={styles.emptyItem}>No projects found</li>
              )}
            </ul>
          </div>
          <div className={styles.createButtonWrapper}>
            <AppButtonWithIcon icon={<AddIcon />} onClick={handleOpenModal}>
              Create New Board
            </AppButtonWithIcon>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <button className={styles.hideSidebar} onClick={onHideSidebar}>
            <span role="img" aria-label="hide">👁️‍🗨️</span> Hide Sidebar
          </button>
        </div>
      </aside>
      <AddProjectModal isOpen={modalOpen} onClose={handleCloseModal} onSuccess={() => {
        setModalOpen(false);
        refetch(); // Refresh the projects list after creating a new project
      }} />
    </>
  );
};