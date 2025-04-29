"use server";

import { getBaseUrl } from '@/lib/utils';
import { z } from 'zod';
import { headers } from 'next/headers';

const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  projectId: z.string().min(1, 'Project ID is required'),
});

type ActionState = {
  success: true;
  task: any;
  error?: undefined;
} | {
  success: false;
  error: string;
  task?: undefined;
};

export async function createTask(prevState: ActionState | null,formData: FormData): Promise<ActionState> {
  try {
    const validatedFields = TaskSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status') || 'todo',
      projectId: formData.get('projectId'),
    });

    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
      body: JSON.stringify(validatedFields),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }

    const data = await response.json();
    return { success: true, task: data.task };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

export async function updateTask(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const taskId = formData.get('id');
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        projectId: formData.get('projectId'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update task');
    }

    const data = await response.json();
    return { success: true, task: data.task };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

export async function deleteTask(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const taskId = formData.get('id');
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
    }

    return { success: true, task: null };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}

export async function getTasksByProject(projectId: string) {
  try {
    const headersList = await headers();
    const response = await fetch(`${getBaseUrl()}/api/projects/${projectId}/tasks`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
} 