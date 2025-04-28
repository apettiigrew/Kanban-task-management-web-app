"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getTasksByProject as dbGetTasksByProject,
} from '../lib/db';

const TaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['todo', 'doing', 'done']),
});

export async function createTask(prevState: any, formData: FormData) {
  try {
    const validatedFields = TaskSchema.safeParse({
      projectId: formData.get('projectId'),
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
    });
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }
    const { projectId, title, description, status } = validatedFields.data;
    await dbCreateTask({ projectId, title, description: description || '', status });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create task. Please try again.' };
  }
}

export async function updateTask(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string | undefined;
    const description = formData.get('description') as string | undefined;
    const status = formData.get('status') as 'todo' | 'doing' | 'done' | undefined;
    await dbUpdateTask(id, { title, description, status });
    revalidatePath(`/projects/${formData.get('projectId')}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update task. Please try again.' };
  }
}

export async function deleteTask(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const projectId = formData.get('projectId') as string;
    await dbDeleteTask(id);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete task. Please try again.' };
  }
}

export async function getTasksByProject(projectId: string) {
  try {
    const tasks = await dbGetTasksByProject(projectId);
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: 'Failed to fetch tasks. Please try again.' };
  }
} 