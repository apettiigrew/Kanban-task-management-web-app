export interface Column {
  id: string
  title: string
  order: number
  createdAt: Date
  updatedAt: Date
  
  // Foreign keys
  projectId: string
  
  // Relations (optional for API responses)
  project?: {
    id: string
    title: string
  }
  tasks?: Array<{
    id: string
    title: string
    description: string | null
    order: number
    labels: string[]
    dueDate: Date | null
  }>
}

export interface ColumnWithTasks extends Column {
  tasks: Array<{
    id: string
    title: string
    description: string | null
    order: number
    labels: string[]
    dueDate: Date | null
    createdAt: Date
    updatedAt: Date
    projectId: string
    columnId: string
  }>
}
