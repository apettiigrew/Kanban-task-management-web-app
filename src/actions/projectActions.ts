'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Define the schema with Zod
const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" })
});

export interface ProjectValidationResult {
  success: boolean
  errors?: z.ZodFormattedError<{
    title: string;
    description: string;
  }>;
  message?: string;
};

export async function createProject(prevState: ProjectValidationResult, formData: FormData): Promise<ProjectValidationResult> {
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  
  
  const validationResult = projectSchema.safeParse({ title, description });
  
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.format(),
      message: 'Validation failed'
    };
  }
  
  try {
    // Make API call or database operation
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error || 'Failed to create project'
      };
    }

    
    return {
      success: true,
      message: 'Project created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create project'
    };
  }
} 