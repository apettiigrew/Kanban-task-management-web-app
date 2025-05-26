import React from 'react';
import { Project } from '@/hooks/useProjects';
import { EditIcon, DeleteIcon } from '@/components/icons/icons';
import styles from './project-card.module.scss';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className={styles.projectCard}>
      <div className={styles.projectCardHeader}>
        {project.title}

        <div className={styles.iconGroups}>
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            aria-label="Edit project"
          >
            <EditIcon />
          </button>
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            aria-label="Delete project"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
      <div className={styles.projectCardDesc}>{project.description}</div>
    </div>
  );
} 