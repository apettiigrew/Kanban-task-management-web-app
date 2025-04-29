'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ProjectView.module.css';
import { getProjects } from '@/features/project/actions/project';
import Sidebar from './Sidebar';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export default function ProjectView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects: fetchedProjects = [] } = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Sidebar />
      <div className={styles.projectView}>
        <div className={styles.loading}>Loading projects...</div>
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
        <Link href="/projects/new" className={styles.createButton}>
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
        </Link>
      </header>

      <main className={styles.content}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No projects yet</h2>
            <p className={styles.emptyText}>Create your first project to get started</p>
            <Link href="/projects/new" className={styles.createButton}>
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
            </Link>
          </div>
        ) : (
          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className={styles.projectCard}
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
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
} 