import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Project {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
}

export interface ProjectsQueryParams {
  search?: string;
  sort?: 'asc' | 'desc';
}

export interface UpdateProjectDTO {
  id: number;
  title: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Fetch all projects or filtered projects
export function useProjectsQuery(params?: ProjectsQueryParams) {
  return useQuery<Project[]>({
    queryKey: ['projects', params || {}],
    queryFn: async () => {
      // Always fetch all projects from the API (since your API does not support search/sort params)
      const response = await fetch(`${API_URL}/api/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      let projects: Project[] = await response.json();
      // If params are provided, filter/sort client-side
      if (params) {
        if (params.search) {
          projects = projects.filter(p => p.title.toLowerCase().includes(params.search!.toLowerCase()));
        }
        if (params.sort) {
          projects = projects.sort((a, b) => {
            if (params.sort === 'desc') {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
          });
        }
      }
      return projects;
    },
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProject: CreateProjectDTO) => {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all projects queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Update an existing project
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: UpdateProjectDTO) => {
      const response = await fetch(`${API_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all projects queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
} 