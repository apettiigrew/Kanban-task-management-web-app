export interface Project {
  id: number
  name: string
  emoji: string
  tasks: number
  status: "In Progress" | "Not Started" | "Planning" | "Completed"
  dueDate: string
}
