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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Fetch all projects
export function useProjectsQuery() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
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
      // Invalidate projects query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
} 