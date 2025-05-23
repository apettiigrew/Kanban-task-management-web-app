import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { TaskService } from '@/lib/services/taskService';
import { ProjectService } from '@/lib/services/projectService';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Input validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized task' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = taskSchema.parse(body);
    
    // Verify project exists and belongs to user
    const project = await ProjectService.getProjectById(validatedData.projectId, session.user.id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Create task
    const task = await TaskService.createTask(validatedData);
    
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }
    
    console.error('Error creating task:', error);
    return Response.json({ error: 'Failed to create task' }, { status: 500 });
  }
} 