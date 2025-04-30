'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProject';
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  // setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  refetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectContextProvider({ children }: { children: ReactNode }) {
  // const [projects, setProjects] = useState<Project[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const { projects, loading, error, setProjects, fetchProjects } = useProjects();
 
  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((updatedProject: Project) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);

  const value = {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetchProjects: fetchProjects
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