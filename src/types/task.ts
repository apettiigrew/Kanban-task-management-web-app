export interface Task {
  id: string
  title: string
  description: string | null
  order: number
  labels: string[]
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  
  // Foreign keys
  projectId: string
  columnId: string
  
  // Relations (optional for API responses)
  project?: {
    id: string
    title: string
  }
  column?: {
    id: string
    title: string
  }
}

export interface TaskWithDetails extends Task {
  project: {
    id: string
    title: string
  }
  column: {
    id: string
    title: string
  }
}
