'use client'

import React from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Column, ColumnWithTasks } from '../../types/column'
import { apiRequest, FormError, parseApiError } from '@/lib/form-error-handler'

// Query key factory for columns
export const columnKeys = {
  all: ['columns'] as const,
  lists: () => [...columnKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...columnKeys.lists(), filters] as const,
  details: () => [...columnKeys.all, 'detail'] as const,
  detail: (id: string) => [...columnKeys.details(), id] as const,
  byProject: (projectId: string) => [...columnKeys.all, 'project', projectId] as const,
  byProjectWithTasks: (projectId: string) => [...columnKeys.byProject(projectId), 'withTasks'] as const,
}

// API client functions with enhanced error handling
const fetchColumns = async (projectId?: string): Promise<(Column & { taskCount: number })[]> => {
  const url = projectId ? `/api/columns?projectId=${projectId}` : '/api/columns'
  return apiRequest<(Column & { taskCount: number })[]>(url)
}

const fetchColumn = async (id: string): Promise<Column & { taskCount: number }> => {
  return apiRequest<Column & { taskCount: number }>(`/api/columns/${id}`)
}

const fetchColumnsWithTasks = async (projectId: string): Promise<ColumnWithTasks[]> => {
  return apiRequest<ColumnWithTasks[]>(`/api/columns?projectId=${projectId}&includeTasks=true`)
}

// Types for mutation data
interface CreateColumnData {
  title: string
  projectId: string
  order?: number
}

interface UpdateColumnData {
  title?: string
  order?: number
}

interface ReorderColumnsData {
  projectId: string
  columnOrders: Array<{
    id: string
    order: number
  }>
}

const createColumn = async (data: CreateColumnData): Promise<Column & { taskCount: number }> => {
  return apiRequest<Column & { taskCount: number }>('/api/columns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

const updateColumn = async ({ id, data }: { id: string; data: UpdateColumnData }): Promise<Column & { taskCount: number }> => {
  return apiRequest<Column & { taskCount: number }>(`/api/columns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

const deleteColumn = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/columns/${id}`, {
    method: 'DELETE',
  })
}

const reorderColumns = async (data: ReorderColumnsData): Promise<void> => {
  return apiRequest<void>('/api/columns', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Hooks
interface UseColumnsOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
  projectId?: string
}

export const useColumns = (options: UseColumnsOptions = {}) => {
  const { projectId, ...queryOptions } = options
  
  return useQuery({
    queryKey: projectId ? columnKeys.byProject(projectId) : columnKeys.lists(),
    queryFn: () => fetchColumns(projectId),
    enabled: queryOptions.enabled !== false,
    refetchOnWindowFocus: queryOptions.refetchOnWindowFocus ?? true,
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof FormError || (error instanceof Error && error.message.includes('4'))) {
        return false
      }
      return failureCount < 3
    },
  })
}

interface UseColumnOptions extends UseColumnsOptions {
  id: string
}

export const useColumn = ({ id, ...options }: UseColumnOptions) => {
  return useQuery({
    queryKey: columnKeys.detail(id),
    queryFn: () => fetchColumn(id),
    enabled: options.enabled !== false && !!id,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof FormError || (error instanceof Error && error.message.includes('4'))) {
        return false
      }
      return failureCount < 3
    },
  })
}

interface UseColumnsWithTasksOptions extends UseColumnsOptions {
  projectId: string
}

export const useColumnsWithTasks = ({ projectId, ...options }: UseColumnsWithTasksOptions) => {
  return useQuery({
    queryKey: columnKeys.byProjectWithTasks(projectId),
    queryFn: () => fetchColumnsWithTasks(projectId),
    enabled: options.enabled !== false && !!projectId,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes (shorter for tasks)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof FormError || (error instanceof Error && error.message.includes('4'))) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Enhanced mutation hooks with form error handling
interface UseCreateColumnOptions {
  onSuccess?: (data: Column & { taskCount: number }) => void
  onError?: (error: FormError) => void
  onFieldErrors?: (errors: Record<string, string>) => void
}

interface UseUpdateColumnOptions {
  onSuccess?: (data: Column & { taskCount: number }) => void
  onError?: (error: FormError) => void
  onFieldErrors?: (errors: Record<string, string>) => void
}

interface UseDeleteColumnOptions {
  onSuccess?: () => void
  onError?: (error: FormError) => void
}

interface UseReorderColumnsOptions {
  onSuccess?: () => void
  onError?: (error: FormError) => void
}

export const useCreateColumn = (options: UseCreateColumnOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createColumn,
    onMutate: async (newColumn) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnKeys.byProject(newColumn.projectId) })
      await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(newColumn.projectId) })
      await queryClient.cancelQueries({ queryKey: columnKeys.lists() })

      // Snapshot the previous values
      const previousColumns = queryClient.getQueryData(columnKeys.byProject(newColumn.projectId))
      const previousColumnsWithTasks = queryClient.getQueryData(columnKeys.byProjectWithTasks(newColumn.projectId))
      const previousAllColumns = queryClient.getQueryData(columnKeys.lists())

      // Create optimistic column with temporary ID
      const optimisticColumn: Column & { taskCount: number } = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        title: newColumn.title,
        projectId: newColumn.projectId,
        order: newColumn.order ?? 0,
        taskCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Optimistically add the new column to the project's columns
      queryClient.setQueryData(columnKeys.byProject(newColumn.projectId), (oldData: (Column & { taskCount: number })[] | undefined) => {
        if (oldData) {
          return [...oldData, optimisticColumn]
        }
        return [optimisticColumn]
      })

      // Optimistically add to all columns if that query exists
      queryClient.setQueryData(columnKeys.lists(), (oldData: (Column & { taskCount: number })[] | undefined) => {
        if (oldData) {
          return [...oldData, optimisticColumn]
        }
        return undefined // Don't create data if it doesn't exist
      })

      // Return a context object with the snapshotted values
      return { previousColumns, previousColumnsWithTasks, previousAllColumns, optimisticColumn }
    },
    onError: (error: FormError, newColumn, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousColumns) {
        queryClient.setQueryData(columnKeys.byProject(newColumn.projectId), context.previousColumns)
      }
      if (context?.previousColumnsWithTasks) {
        queryClient.setQueryData(columnKeys.byProjectWithTasks(newColumn.projectId), context.previousColumnsWithTasks)
      }
      if (context?.previousAllColumns) {
        queryClient.setQueryData(columnKeys.lists(), context.previousAllColumns)
      }

      // Handle errors through options
      if (error.fieldErrors && options.onFieldErrors) {
        options.onFieldErrors(error.fieldErrors)
      } else if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (data, variables, context) => {
      // Update the optimistic data with real data
      queryClient.setQueryData(columnKeys.byProject(variables.projectId), (oldData: (Column & { taskCount: number })[] | undefined) => {
        if (oldData) {
          return oldData.map(column => 
            column.id === context?.optimisticColumn.id ? data : column
          )
        }
        return [data]
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: columnKeys.byProject(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: columnKeys.byProjectWithTasks(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: columnKeys.lists() })
      
      if (options.onSuccess) {
        options.onSuccess(data)
      }
    },
  })
}

export const useUpdateColumn = (options: UseUpdateColumnOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateColumn,
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnKeys.detail(id) })
      
      // Get current column data to find projectId for invalidation
      const currentColumn = queryClient.getQueryData(columnKeys.detail(id)) as (Column & { taskCount: number }) | undefined
      
      if (currentColumn) {
        await queryClient.cancelQueries({ queryKey: columnKeys.byProject(currentColumn.projectId) })
        await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(currentColumn.projectId) })
      }

      // Snapshot the previous values
      const previousColumn = queryClient.getQueryData(columnKeys.detail(id))
      const previousColumns = currentColumn ? queryClient.getQueryData(columnKeys.byProject(currentColumn.projectId)) : undefined

      // Optimistically update the column
      if (currentColumn) {
        const optimisticColumn = { ...currentColumn, ...data, updatedAt: new Date() }
        
        queryClient.setQueryData(columnKeys.detail(id), optimisticColumn)
        
        // Update in project columns list
        queryClient.setQueryData(columnKeys.byProject(currentColumn.projectId), (oldData: (Column & { taskCount: number })[] | undefined) => {
          if (oldData) {
            return oldData.map(column => column.id === id ? optimisticColumn : column)
          }
          return oldData
        })
      }

      return { previousColumn, previousColumns, currentColumn }
    },
    onError: (error: FormError, { id, data }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousColumn) {
        queryClient.setQueryData(columnKeys.detail(id), context.previousColumn)
      }
      if (context?.currentColumn && context?.previousColumns) {
        queryClient.setQueryData(columnKeys.byProject(context.currentColumn.projectId), context.previousColumns)
      }

      // Handle errors through options
      if (error.fieldErrors && options.onFieldErrors) {
        options.onFieldErrors(error.fieldErrors)
      } else if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (data, { id }, context) => {
      // Update with real data
      queryClient.setQueryData(columnKeys.detail(id), data)
      
      if (context?.currentColumn) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: columnKeys.byProject(context.currentColumn.projectId) })
        queryClient.invalidateQueries({ queryKey: columnKeys.byProjectWithTasks(context.currentColumn.projectId) })
      }
      
      if (options.onSuccess) {
        options.onSuccess(data)
      }
    },
  })
}

export const useDeleteColumn = (options: UseDeleteColumnOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteColumn,
    onMutate: async (id) => {
      // Get current column data to find projectId for invalidation
      const currentColumn = queryClient.getQueryData(columnKeys.detail(id)) as (Column & { taskCount: number }) | undefined
      
      if (currentColumn) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: columnKeys.byProject(currentColumn.projectId) })
        await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(currentColumn.projectId) })
        await queryClient.cancelQueries({ queryKey: columnKeys.detail(id) })

        // Snapshot the previous values
        const previousColumns = queryClient.getQueryData(columnKeys.byProject(currentColumn.projectId))
        const previousColumnsWithTasks = queryClient.getQueryData(columnKeys.byProjectWithTasks(currentColumn.projectId))

        // Optimistically remove the column
        queryClient.setQueryData(columnKeys.byProject(currentColumn.projectId), (oldData: (Column & { taskCount: number })[] | undefined) => {
          if (oldData) {
            return oldData.filter(column => column.id !== id)
          }
          return oldData
        })

        queryClient.setQueryData(columnKeys.byProjectWithTasks(currentColumn.projectId), (oldData: ColumnWithTasks[] | undefined) => {
          if (oldData) {
            return oldData.filter(column => column.id !== id)
          }
          return oldData
        })

        // Remove from detail cache
        queryClient.removeQueries({ queryKey: columnKeys.detail(id) })

        return { previousColumns, previousColumnsWithTasks, currentColumn }
      }

      return { currentColumn }
    },
    onError: (error: FormError, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.currentColumn) {
        if (context.previousColumns) {
          queryClient.setQueryData(columnKeys.byProject(context.currentColumn.projectId), context.previousColumns)
        }
        if (context.previousColumnsWithTasks) {
          queryClient.setQueryData(columnKeys.byProjectWithTasks(context.currentColumn.projectId), context.previousColumnsWithTasks)
        }
        // Restore the column detail
        queryClient.setQueryData(columnKeys.detail(id), context.currentColumn)
      }

      if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (data, id, context) => {
      if (context?.currentColumn) {
        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({ queryKey: columnKeys.byProject(context.currentColumn.projectId) })
        queryClient.invalidateQueries({ queryKey: columnKeys.byProjectWithTasks(context.currentColumn.projectId) })
        queryClient.invalidateQueries({ queryKey: columnKeys.lists() })
      }
      
      if (options.onSuccess) {
        options.onSuccess()
      }
    },
  })
}

export const useReorderColumns = (options: UseReorderColumnsOptions = {}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: reorderColumns,
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnKeys.byProject(data.projectId) })
      await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(data.projectId) })

      // Snapshot the previous values
      const previousColumns = queryClient.getQueryData(columnKeys.byProject(data.projectId))
      const previousColumnsWithTasks = queryClient.getQueryData(columnKeys.byProjectWithTasks(data.projectId))

      // Optimistically reorder columns
      queryClient.setQueryData(columnKeys.byProject(data.projectId), (oldData: (Column & { taskCount: number })[] | undefined) => {
        if (oldData) {
          const newData = [...oldData]
          // Apply new order based on columnOrders
          data.columnOrders.forEach(({ id, order }) => {
            const columnIndex = newData.findIndex(col => col.id === id)
            if (columnIndex !== -1) {
              newData[columnIndex] = { ...newData[columnIndex], order }
            }
          })
          // Sort by new order
          return newData.sort((a, b) => a.order - b.order)
        }
        return oldData
      })

      return { previousColumns, previousColumnsWithTasks }
    },
    onError: (error: FormError, data, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousColumns) {
        queryClient.setQueryData(columnKeys.byProject(data.projectId), context.previousColumns)
      }
      if (context?.previousColumnsWithTasks) {
        queryClient.setQueryData(columnKeys.byProjectWithTasks(data.projectId), context.previousColumnsWithTasks)
      }

      if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (result, data) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: columnKeys.byProject(data.projectId) })
      queryClient.invalidateQueries({ queryKey: columnKeys.byProjectWithTasks(data.projectId) })
      
      if (options.onSuccess) {
        options.onSuccess()
      }
    },
  })
}

// Utility hooks
export const useInvalidateColumns = () => {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: columnKeys.all }),
    invalidateByProject: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: columnKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: columnKeys.byProjectWithTasks(projectId) })
    },
    invalidateColumn: (id: string) => queryClient.invalidateQueries({ queryKey: columnKeys.detail(id) }),
  }
}

export const useColumnMutationStates = () => {
  const queryClient = useQueryClient()
  
  return {
    isCreating: queryClient.isMutating({ mutationKey: ['createColumn'] }) > 0,
    isUpdating: queryClient.isMutating({ mutationKey: ['updateColumn'] }) > 0,
    isDeleting: queryClient.isMutating({ mutationKey: ['deleteColumn'] }) > 0,
    isReordering: queryClient.isMutating({ mutationKey: ['reorderColumns'] }) > 0,
  }
} 