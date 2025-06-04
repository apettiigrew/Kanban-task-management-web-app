export interface Project {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  
  // Relations (optional for API responses)
  columns?: Array<{
    id: string
    title: string
    order: number
    createdAt: Date
    updatedAt: Date
  }>
  tasks?: Array<{
    id: string
    title: string
    description: string | null
    order: number
    labels: string[]
    dueDate: Date | null
  }>
}

export interface ProjectWithStats extends Project {
  taskCount: number
  completedTaskCount: number
  columnCount: number
}
