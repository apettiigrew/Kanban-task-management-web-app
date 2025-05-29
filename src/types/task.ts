export interface Task {
  id: string;
  content: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  lists: TaskList[];
}
