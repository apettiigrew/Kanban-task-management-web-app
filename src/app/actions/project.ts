'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createProject as dbCreateProject, getProjects as dbGetProjects, getProject as dbGetProject, updateProject as dbUpdateProject, deleteProject as dbDeleteProject } from '../lib/db'

interface Project {
  id: string
  title: string
  description: string
  createdAt: Date
}

// In-memory database
let projects: Project[] = []

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export async function createProject(prevState: any, formData: FormData) {
  try {
    const validatedFields = ProjectSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
    })

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0].message,
      }
    }

    const { title, description } = validatedFields.data
    await dbCreateProject({ title, description: description || '' })
    
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    return {
      error: 'Failed to create project. Please try again.',
    }
  }
}

export async function getProjects() {
  try {
    const projects = await dbGetProjects() as Project[]
    return { success: true, projects }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return {
      success: false,
      error: 'Failed to fetch projects. Please try again.',
    }
  }
}

export async function getProject(id: string) {
  try {
    const project = await dbGetProject(id)
    return { success: true, project }
  } catch (error) {
    console.error('Error fetching project:', error)
    return {
      success: false,
      error: 'Failed to fetch project. Please try again.',
    }
  }
}

export async function updateProject(prevState: any, formData: FormData) {
  try {
    const validatedFields = ProjectSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
    })

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0].message,
        success: false
      }
    }

    const id = formData.get('id') as string;
    const { title, description } = validatedFields.data;
    await dbUpdateProject(id, { title, description: description || '' })
    
    revalidatePath('/')
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    return {
      error: 'Failed to update project. Please try again.',
      success: false
    }
  }
}

export async function deleteProject(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    await dbDeleteProject(id);
    
    revalidatePath('/')
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    return {
      error: 'Failed to delete project. Please try again.',
      success: false
    }
  }
} 