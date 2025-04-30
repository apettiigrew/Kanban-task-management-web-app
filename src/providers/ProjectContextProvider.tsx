'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProject';
import { useSession } from 'next-auth/react';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  refetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectContextProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { projects, loading, error, refetchProjects } = useProjects();

  const addProject = useCallback((project: Project) => {
    projects.push(project);
    refetchProjects();
  }, [projects, refetchProjects]);

  const updateProject = useCallback((updatedProject: Project) => {
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      refetchProjects();
    }
  }, [projects, refetchProjects]);

  const deleteProject = useCallback((projectId: string) => {
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects.splice(index, 1);
      refetchProjects();
    }
  }, [projects, refetchProjects]);

  const value = {
    projects: status === 'authenticated' ? projects : [],
    loading: status === 'loading' || loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetchProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
} 