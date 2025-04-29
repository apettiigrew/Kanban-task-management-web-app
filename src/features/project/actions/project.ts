'use server'

import { getBaseUrl } from '@/lib/utils';
import { CreateProjectDto, Project } from '@/types/project'
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod'

type ActionState = {
  success: true;
  project: Project;
  error?: undefined;
} | {
  success: false;
  error: string;
  project?: undefined;
}

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})


export async function createProject(
  prevState: { success: boolean; error: null | string; project: any },
  formData: FormData
): Promise<{ success: boolean; error: null | string; project: any }> {
  try {
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string
    };
    
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project in actions/project.ts');
    }

    revalidatePath('/projects');
    const result = await response.json();
    return { success: true, error: null, project: result.project };
  } catch (error) {
    console.error('Error creating project in actions/project.ts:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create project in actions/project.ts', project: null };
  }
}

export async function getProjects() {
  try {
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function getProject(id: string) {
  try {
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function updateProject(id: string, data: Partial<CreateProjectDto>) {
  try {
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update project');
    }

    const result = await response.json();
    return { success: true, project: result.project };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update project' };
  }
}

export async function deleteProject(id: string) {
  try {
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete project');
    }
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' };
  }
} 