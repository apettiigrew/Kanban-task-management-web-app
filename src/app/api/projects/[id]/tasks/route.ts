import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProjectService } from '@/lib/services/projectService';
import { TaskService } from '@/lib/services/taskService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First verify the project exists and belongs to the user
    const project = await ProjectService.getProjectById(params.id, session.user.id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('Fetching tasks for project:', params.id);
    const tasks = await TaskService.getTasksByProject(params.id);
    return Response.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
} 