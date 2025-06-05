'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest, FormError } from '@/lib/form-error-handler'
import { columnKeys } from '../queries/use-columns'
import { projectKeys } from '../queries/use-projects'
import { ProjectWithColumnsAndTasks, TColumn } from '@/utils/data'

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

// API client functions for mutations
const createColumn = async (data: CreateColumnData): Promise<TColumn & { taskCount: number }> => {
  return apiRequest<TColumn & { taskCount: number }>('/api/columns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

const updateColumn = async ({ id, data }: { id: string; data: UpdateColumnData }): Promise<TColumn & { taskCount: number }> => {
  return apiRequest<TColumn & { taskCount: number }>(`/api/columns/${id}`, {
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

// Enhanced mutation hooks with form error handling and optimistic updates
interface UseCreateColumnOptions {
  onSuccess?: (data: TColumn & { taskCount: number }) => void
  onError?: (error: FormError) => void
  onFieldErrors?: (errors: Record<string, string>) => void
}

interface UseUpdateColumnOptions {
  onSuccess?: (data: TColumn & { taskCount: number }) => void
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
    mutationKey: ['createColumn'],
    mutationFn: createColumn,
    onMutate: async (newColumn) => {
     
      const previousProject = queryClient.getQueryData(projectKeys.detail(newColumn.projectId))
      console.log("Previous project", previousProject)
     
      const optimisticColumn: TColumn = {
        id: `temp-${Date.now()}`,
        title: newColumn.title,
        projectId: newColumn.projectId,
        order: newColumn.order ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        cards: [],
      }

      queryClient.setQueryData(projectKeys.detail(newColumn.projectId), (oldData: ProjectWithColumnsAndTasks) => {
          return { ...oldData, columns: [...oldData.columns, optimisticColumn] }
      })

      return { optimisticColumn }
    },
    onError: (error: FormError, newColumn, context) => {
      if (error.fieldErrors && options.onFieldErrors) {
        options.onFieldErrors(error.fieldErrors)
      } else if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (data, variables, context) => {
      // Update the optimistic data with real data
      queryClient.setQueryData(columnKeys.byProject(variables.projectId), (oldData: (TColumn & { taskCount: number })[] | undefined) => {
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
    mutationKey: ['updateColumn'],
    mutationFn: updateColumn,
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnKeys.detail(id) })
      
      // Get current column data to find projectId for invalidation
      const currentColumn = queryClient.getQueryData(columnKeys.detail(id)) as (TColumn & { taskCount: number }) | undefined
      
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
        queryClient.setQueryData(columnKeys.byProject(currentColumn.projectId), (oldData: (TColumn)[] | undefined) => {
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
    mutationKey: ['deleteColumn'],
    mutationFn: deleteColumn,
    onMutate: async (id) => {
      // Get current column data to find projectId for invalidation
      const currentColumn = queryClient.getQueryData(columnKeys.detail(id)) as (TColumn) | undefined
      
      if (currentColumn) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: columnKeys.byProject(currentColumn.projectId) })
        await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(currentColumn.projectId) })
        await queryClient.cancelQueries({ queryKey: columnKeys.detail(id) })

        // Snapshot the previous values
        const previousColumns = queryClient.getQueryData(columnKeys.byProject(currentColumn.projectId))
        const previousColumnsWithTasks = queryClient.getQueryData(columnKeys.byProjectWithTasks(currentColumn.projectId))

        // Optimistically remove the column
        queryClient.setQueryData(columnKeys.byProject(currentColumn.projectId), (oldData: (TColumn)[] | undefined) => {
          if (oldData) {
            return oldData.filter(column => column.id !== id)
          }
          return oldData
        })

        queryClient.setQueryData(columnKeys.byProjectWithTasks(currentColumn.projectId), (oldData: TColumn[] | undefined) => {
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
    mutationKey: ['reorderColumns'],
    mutationFn: reorderColumns,
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnKeys.byProject(data.projectId) })
      await queryClient.cancelQueries({ queryKey: columnKeys.byProjectWithTasks(data.projectId) })

      // Snapshot the previous values
      const previousColumns = queryClient.getQueryData(columnKeys.byProject(data.projectId))
      const previousColumnsWithTasks = queryClient.getQueryData(columnKeys.byProjectWithTasks(data.projectId))

      // Optimistically reorder columns
      queryClient.setQueryData(columnKeys.byProject(data.projectId), (oldData: (TColumn)[] | undefined) => {
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

// Utility hooks for mutation states
export const useColumnMutationStates = () => {
  const queryClient = useQueryClient()
  
  return {
    isCreating: queryClient.isMutating({ mutationKey: ['createColumn'] }) > 0,
    isUpdating: queryClient.isMutating({ mutationKey: ['updateColumn'] }) > 0,
    isDeleting: queryClient.isMutating({ mutationKey: ['deleteColumn'] }) > 0,
    isReordering: queryClient.isMutating({ mutationKey: ['reorderColumns'] }) > 0,
  }
}

