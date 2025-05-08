import React from 'react';
import { Project } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/project-card/project-card';
import styles from './project-grid.module.scss';

interface ProjectGridProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function ProjectGrid({
  projects,
  isLoading,
  isError,
  onEditProject,
  onDeleteProject
}: ProjectGridProps) {
  if (isLoading) return <div className={styles.message}>Loading projects...</div>;
  if (isError) return <div className={styles.message}>Failed to load projects.</div>;
  if (!projects || !projects.length) return <div className={styles.message}>No projects found.</div>;

  return (
    <div className={styles.projectsGrid}>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
} 