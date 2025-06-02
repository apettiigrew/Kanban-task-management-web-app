'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Project, ProjectWithStats } from '../../types/project'

// Query key factory for projects
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
}

// API client functions
const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch projects')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

const fetchProject = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`/api/projects/${id}?includeRelations=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch project')
    }

    return data.data
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    throw error
  }
}

const fetchProjectsWithStats = async (): Promise<ProjectWithStats[]> => {
  try {
    const response = await fetch('/api/projects?includeStats=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch projects with stats: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch projects with stats')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching projects with stats:', error)
    throw error
  }
}

// Mutation API functions
interface CreateProjectData {
  title: string
  description?: string | null
  emoji?: string | null
}

interface UpdateProjectData {
  title?: string
  description?: string | null
  emoji?: string | null
}

const createProject = async (data: CreateProjectData): Promise<Project> => {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create project')
    }

    return result.data
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

const updateProject = async ({ id, data }: { id: string; data: UpdateProjectData }): Promise<Project> => {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update project')
    }

    return result.data
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

const deleteProject = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete project')
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// Hooks
interface UseProjectsOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: fetchProjects,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 3
    },
  })
}

interface UseProjectOptions extends UseProjectsOptions {
  id: string
}

export const useProject = ({ id, ...options }: UseProjectOptions) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: options.enabled !== false && !!id,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 3
    },
  })
}

export const useProjectsWithStats = (options: UseProjectsOptions = {}) => {
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: fetchProjectsWithStats,
    enabled: options.enabled !== false,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes (shorter for stats)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Mutation hooks
interface UseCreateProjectOptions {
  onSuccess?: (data: Project) => void
  onError?: (error: Error) => void
}

interface UseUpdateProjectOptions {
  onSuccess?: (data: Project) => void
  onError?: (error: Error) => void
}

interface UseDeleteProjectOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useCreateProject = (options: UseCreateProjectOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
      
      // Optionally update the cache optimistically
      queryClient.setQueryData(projectKeys.lists(), (oldData: Project[] | undefined) => {
        if (oldData) {
          return [...oldData, data]
        }
        return [data]
      })
      
      // Call custom onSuccess callback if provided
      options.onSuccess?.(data)
    },
    onError: (error: Error) => {
      console.error('Error in useCreateProject:', error)
      
      // Call custom onError callback if provided
      options.onError?.(error)
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 2
    },
  })
}

export const useUpdateProject = (options: UseUpdateProjectOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProject,
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(id))
      const previousProjects = queryClient.getQueryData(projectKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData(projectKeys.detail(id), (old: Project | undefined) => {
        if (!old) return old
        return { ...old, ...data }
      })

      queryClient.setQueryData(projectKeys.lists(), (old: Project[] | undefined) => {
        if (!old) return old
        return old.map(project => 
          project.id === id ? { ...project, ...data } : project
        )
      })

      // Return a context object with the snapshotted value
      return { previousProject, previousProjects }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject)
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects)
      }
      
      console.error('Error in useUpdateProject:', error)
      options.onError?.(error)
    },
    onSuccess: (data, { id }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
      
      options.onSuccess?.(data)
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 2
    },
  })
}

export const useDeleteProject = (options: UseDeleteProjectOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(id))
      const previousProjects = queryClient.getQueryData(projectKeys.lists())

      // Optimistically remove the project from the list
      queryClient.setQueryData(projectKeys.lists(), (old: Project[] | undefined) => {
        if (!old) return old
        return old.filter(project => project.id !== id)
      })

      // Remove the individual project from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) })

      // Return a context object with the snapshotted value
      return { previousProject, previousProjects, deletedId: id }
    },
    onError: (error, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects)
      }
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject)
      }
      
      console.error('Error in useDeleteProject:', error)
      options.onError?.(error)
    },
    onSuccess: () => {
      // Invalidate and refetch all project-related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
      
      options.onSuccess?.()
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Utility hook for invalidating all project queries
export const useInvalidateProjects = () => {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
    invalidateProject: (id: string) => queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: projectKeys.stats() }),
  }
}
