'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './sidebar.module.css';
import ProjectModal from '../modals/project/create/project-modal';
import UpdateProjectModal from '../modals/project/update/update-project-modal';
import DeleteProjectModal from '../modals/project/delete/delete-project-modal';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export default function Sidebar() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = useCallback(() => {
    setIsModalOpen(false);
    fetchProjects();
  }, []);

  const handleProjectUpdated = useCallback(() => {
    setIsUpdateModalOpen(false);
    setSelectedProject(null);
    fetchProjects();
  }, []);

  const handleProjectDeleted = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
    fetchProjects();
  }, []);

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>|||</div>
        <span className={styles.logoText}>kanban</span>
      </Link>

      <div className={styles.boardsSection}>
        <h2 className={styles.sectionTitle}>
          ALL PROJECTS ({projects.length})
        </h2>
        <nav className={styles.boardsList}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectItem}>
              <Link
                href={`/projects/${project.id}`}
                className={styles.boardLink}
              >
                <svg className={styles.boardIcon} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.444Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2A1.556 1.556 0 0 0 14.666 13.11v-1.555ZM14.666 2.89A1.556 1.556 0 0 0 13.11 1.333h-2v3.111h3.556V2.89Z" fill="currentColor"/>
                </svg>
                {project.title}
              </Link>
              <div className={styles.projectActions}>
                <button 
                  className={styles.editButton}
                  onClick={() => handleProjectClick(project)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12.667V16h3.333l9.83-9.83-3.333-3.333L0 12.667Zm15.56-9.56a.889.889 0 0 0 0-1.257L13.15.44a.889.889 0 0 0-1.257 0l-1.33 1.33 3.333 3.333 1.33-1.33Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDeleteClick(project)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4h-3.333V2.667A1.333 1.333 0 0 0 9.333 1.333H6.667A1.333 1.333 0 0 0 5.333 2.667V4H2a.667.667 0 0 0 0 1.333h.667v8A1.333 1.333 0 0 0 4 14.667h8a1.333 1.333 0 0 0 1.333-1.334v-8H14a.667.667 0 1 0 0-1.333ZM6.667 2.667h2.666V4H6.667V2.667Zm5.666 10.666H3.667v-8h8.666v8Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <div className={styles.createProjectContainer}>
            <button 
              className={styles.createBoardButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Create New Project
            </button>
          </div>
        </nav>
      </div>

      {session && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{session.user.name}</span>
            <span className={styles.userEmail}>{session.user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.667 14.667H2.667A1.333 1.333 0 0 1 1.333 13.333V2.667A1.333 1.333 0 0 1 2.667 1.333h4a.667.667 0 0 0 0-1.333h-4A2.667 2.667 0 0 0 0 2.667v10.666A2.667 2.667 0 0 0 2.667 16h4a.667.667 0 0 0 0-1.333Z" fill="currentColor"/>
              <path d="M15.447 7.447 12.113 4.113a.667.667 0 1 0-.943.943L13.727 7.6H5.333a.667.667 0 0 0 0 1.333h8.394l-2.557 2.557a.667.667 0 1 0 .943.943l3.334-3.333a.667.667 0 0 0 0-.943Z" fill="currentColor"/>
            </svg>
            Logout
          </button>
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {selectedProject && (
        <UpdateProjectModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedProject(null);
          }}
          onProjectUpdated={handleProjectUpdated}
          project={selectedProject}
        />
      )}

      {selectedProject && (
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProject(null);
          }}
          onProjectDeleted={handleProjectDeleted}
          project={selectedProject}
        />
      )}
    </aside>
  );
} 