'use client';

import { use, useEffect, useState } from 'react';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import Sidebar from '@/components/Sidebar';
import styles from './projects-detail.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
}

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } =  use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${id}`);
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <div className={styles.pageContent}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <div className={styles.pageContent}>
          <div className={styles.error}>{error || 'Project not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>{project.title}</h1>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
        </div>
        <ProjectKanbanBoard projectId={id} />
      </div>
    </div>
  );
} 