'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest, FormError } from '@/lib/form-error-handler'
import { taskKeys } from '../queries/use-tasks'
import { columnKeys } from '../queries/use-columns'
import { projectKeys } from '../queries/use-projects'
import { Task, CreateTask, UpdateTask, MoveTask, ReorderTasks, BulkUpdateTasks } from '@/lib/validations/task'
import { ProjectWithColumnsAndTasks } from '@/utils/data'

// API client functions for mutations
const createTask = async (data: CreateTask): Promise<Task> => {
    return apiRequest<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

const updateTask = async ({ id, data }: { id: string; data: UpdateTask }): Promise<Task> => {
    return apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

const deleteTask = async (id: string): Promise<void> => {
    return apiRequest<void>(`/api/tasks/${id}`, {
        method: 'DELETE',
    })
}

const moveTask = async (data: MoveTask): Promise<void> => {
    return apiRequest<void>('/api/tasks/move', {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

const reorderTasks = async (data: ReorderTasks): Promise<void> => {
    return apiRequest<void>('/api/tasks', {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

const bulkUpdateTasks = async (data: BulkUpdateTasks): Promise<void> => {
    return apiRequest<void>('/api/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

// Enhanced mutation hooks with form error handling and optimistic updates
interface UseCreateTaskOptions {
    onSuccess?: (data: Task) => void
    onError?: (error: FormError) => void
    onFieldErrors?: (errors: Record<string, string>) => void
}

interface UseUpdateTaskOptions {
    onSuccess?: (data: Task) => void
    onError?: (error: FormError) => void
    onFieldErrors?: (errors: Record<string, string>) => void
}

interface UseDeleteTaskOptions {
    onSuccess?: () => void
    onError?: (error: FormError) => void
}

interface UseMoveTaskOptions {
    onSuccess?: () => void
    onError?: (error: FormError) => void
}

interface UseReorderTasksOptions {
    onSuccess?: () => void
    onError?: (error: FormError) => void
}

interface UseBulkUpdateTasksOptions {
    onSuccess?: () => void
    onError?: (error: FormError) => void
}

export const useCreateTask = (options: UseCreateTaskOptions = {}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['createTask'],
        mutationFn: createTask,
        onMutate: async (newTask) => {

            // get snapshot of preivous state
            const previousProject = queryClient.getQueryData(projectKeys.detail(newTask.projectId))

            const optimisticTask: CreateTask & {id: string, createdAt: Date, updatedAt: Date} = {
                id: "temp",
                title: newTask.title,
                description: newTask.description || "",
                order: newTask.order ?? 0,
                projectId: newTask.projectId,
                columnId: newTask.columnId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            console.log('optimisticTask', optimisticTask)

            // Optimistically add the new task to various query caches
            queryClient.setQueryData(projectKeys.detail(newTask.projectId), (oldData: ProjectWithColumnsAndTasks) => {
                const column = oldData.columns.find(column => column.id === newTask.columnId)
                if (column) {
                    const newCards = [...column.cards, optimisticTask]
                    const newColumn = { ...column, cards: newCards }
                    const newColumns = oldData.columns.map(column => column.id === newTask.columnId ? newColumn : column)
                    return { ...oldData, columns: newColumns }
                }

                return oldData
            })

            return {
                previousProject
            }
        },
        onError: (error: FormError, newTask, context) => {


            // Handle errors through options
            if (error.fieldErrors && options.onFieldErrors) {
                options.onFieldErrors(error.fieldErrors)
            } else if (options.onError) {
                options.onError(error)
            }
        },
        onSuccess: (data, variables, context) => {
            //Replace optimistic task with real data in all caches
            queryClient.setQueryData(projectKeys.detail(variables.projectId), (oldData: ProjectWithColumnsAndTasks) => {
                const column = oldData.columns.find(column => column.id === variables.columnId)
                if (column) {
                    const newCards = column.cards.map(card => card.id === "temp" ? data : card)
                    const newColumn = { ...column, cards: newCards }
                    const newColumns = oldData.columns.map(column => column.id === variables.columnId ? newColumn : column)
                    return { ...oldData, columns: newColumns }
                }
                return oldData
            })

            // Invalidate related queries to ensure consistency
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })

            if (options.onSuccess) {
                options.onSuccess(data)
            }
        },
    })
}

