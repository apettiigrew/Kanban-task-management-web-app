'use client';

import { useEffect, useState } from 'react';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import styles from './projects-detail.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Project not found'}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{project.title}</h1>
        {project.description && (
          <p className={styles.description}>{project.description}</p>
        )}
      </div>
      <ProjectKanbanBoard projectId={params.id} />
    </div>
  );
} 