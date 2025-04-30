'use client';

import { use, useEffect, useState } from 'react';
import ProjectKanbanBoard from '@/components/kanbanboard/ProjectKanbanBoard';
import Sidebar from '@/components/sidebar/sidebar';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
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

  const router = useRouter();

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

  const onProjectDeleted = () => {
    router.push('/projects');
  };

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
      <Sidebar onProjectDeleted={onProjectDeleted} />
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