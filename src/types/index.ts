export type { Project, ProjectWithStats } from './project'
export type { Column, ColumnWithTasks } from './column'
export type { Task, TaskWithDetails } from './task'

// Board interface for combining project data with columns and tasks
export interface Board {
  id: string
  title: string
  description: string | null
  columns: Array<{
    id: string
    title: string
    order: number
    tasks: Array<{
      id: string
      title: string
      description: string | null
      order: number
      labels: string[]
      dueDate: Date | null
    }>
  }>
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types for UI components
export interface CreateProjectForm {
  title: string
  description?: string
}

export interface CreateColumnForm {
  title: string
  projectId: string
}

export interface CreateTaskForm {
  title: string
  description?: string
  labels?: string[]
  dueDate?: Date
  projectId: string
  columnId: string
}

// Drag and drop types
export interface DragResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}

export interface ReorderRequest {
  id: string
  newOrder: number
  newColumnId?: string // For moving tasks between columns
}
