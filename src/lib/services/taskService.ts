import pool from '@/lib/database-postgresql';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
}

export class TaskService {
  static async createTask(taskData: CreateTaskDto): Promise<Task> {
    const { projectId, title, description, status } = taskData;
    
    try {
      const result = await pool.query(
        `INSERT INTO tasks (project_id, title, description, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, project_id as "projectId", title, description, status, 
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [projectId, title, description, status]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  static async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const result = await pool.query(
        `SELECT id, project_id as "projectId", title, description, status,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM tasks
         WHERE project_id = $1
         ORDER BY created_at ASC`,
        [projectId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }
} 