'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './project-view.module.css';
import Sidebar from '../sidebar/sidebar';
import UpdateProjectModal from '../modals/project/update/update-project-modal';
import DeleteProjectModal from '../modals/project/delete/delete-project-modal';
import AppButton from '../button/app-button';
import ProjectModal from '../modals/project/create/project-modal';
import type { Project } from '@/types/project';
import { useProjectContext } from '@/providers/ProjectContextProvider';

export default function ProjectView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projects, loading, error, refetchProjects } = useProjectContext();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleCloseCreateModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 0);
  }, []);

  const handleProjectCreated = useCallback(() => {
    refetchProjects();
    handleCloseCreateModal();
  }, [refetchProjects, handleCloseCreateModal]);

  const handleCreateProjectClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleUpdateClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <div className={styles.projectView}>
          <div className={styles.loading}>Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <div className={styles.projectView}>
          <div className={styles.error}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={styles.projectView}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Projects</h1>
        </header>

        <main className={styles.content}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>No projects yet</h2>
              <p className={styles.emptyText}>Create your first project to get started</p>
              <AppButton 
                variant="primary" 
                size="medium" 
                fullWidth 
                onClick={handleCreateProjectClick}
              >
                Create Project
              </AppButton>
            </div>
          ) : (
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <div key={project.id} className={styles.projectCard}>
                  <Link 
                    href={`/projects/${project.id}`}
                    className={styles.projectLink}
                  >
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectDescription}>
                      {project.description || 'No description provided'}
                    </p>
                    <div className={styles.projectMeta}>
                      <span className={styles.projectDate}>
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className={styles.projectActions}>
                    <button
                      onClick={() => handleUpdateClick(project)}
                      className={styles.actionButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
          
      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseCreateModal}
          onProjectCreated={handleProjectCreated}
        />
      )}
      
      {selectedProject && (
        <>
          <UpdateProjectModal
            project={selectedProject}
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedProject(null);
            }}
            onProjectUpdated={() => {
              refetchProjects();
              setIsUpdateModalOpen(false);
              setSelectedProject(null);
            }}
          />
          <DeleteProjectModal
            project={selectedProject}
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProject(null);
            }}
            onProjectDeleted={() => {
              refetchProjects();
              setIsDeleteModalOpen(false);
              setSelectedProject(null);
            }}
          />
        </>
      )}
    </div>
  );
} 