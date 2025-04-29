import pool from '@/lib/database-postgresql';
import { Project, CreateProjectDto } from '@/types/project';

export class ProjectService {
  static async createProject(projectData: CreateProjectDto, userId: string): Promise<Project> {
    const { title, description } = projectData;
    
    try {
      const result = await pool.query(
        `INSERT INTO projects (title, description, user_id)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
        [title, description, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project in projectService.ts');
    }
  }

  static async getProjectsByUserId(userId: string): Promise<Project[]> {
    try {
      const result = await pool.query(
        `SELECT id, title, description, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
         FROM projects
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  static async getProjectById(id: string, userId: string): Promise<Project | null> {
    try {
      const result = await pool.query(
        `SELECT id, title, description, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
         FROM projects
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  static async updateProject(id: string, projectData: Partial<CreateProjectDto>, userId: string): Promise<Project | null> {
    const { title, description } = projectData;
    
    try {
      const result = await pool.query(
        `UPDATE projects
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND user_id = $4
         RETURNING id, title, description, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
        [title, description, id, userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  static async deleteProject(id: string, userId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM projects
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
      );
      
      return Boolean(result.rowCount && result.rowCount > 0);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }
} 