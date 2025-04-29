import pool from '@/lib/database-postgresql';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: Date;
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
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

  static async updateTask(taskId: string, projectId: string, updates: UpdateTaskDto): Promise<Task> {
    try {
      const result = await pool.query(
        `UPDATE tasks
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             status = COALESCE($3, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND project_id = $5
         RETURNING id, project_id as "projectId", title, description, status, 
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [updates.title, updates.description, updates.status, taskId, projectId]
      );

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [taskId]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found');
    }
  }
} 