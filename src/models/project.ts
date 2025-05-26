export interface Project {
  id?: number;
  title: string;
  description: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface CreateProjectDTO {
  title: string;
  description: string | null;
} 