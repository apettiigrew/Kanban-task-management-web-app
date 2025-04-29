import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { TaskService } from '@/lib/services/taskService';
import { ProjectService } from '@/lib/services/projectService';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  projectId: z.string().min(1, 'Project ID is required'),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = updateTaskSchema.parse(body);
    
    // Verify project exists and belongs to user
    const project = await ProjectService.getProjectById(validatedData.projectId, session.user.id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Update task
    const task = await TaskService.updateTask(params.id, validatedData.projectId, validatedData);
    
    return Response.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }
    
    if (error instanceof Error && error.message === 'Task not found') {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    
    console.error('Error updating task:', error);
    return Response.json({ error: 'Failed to update task' }, { status: 500 });
  }
} 