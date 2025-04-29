import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ProjectService } from '@/lib/services/projectService';
import { CreateProjectDto } from '@/types/project';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('GET session:', session);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await ProjectService.getProjectsByUserId(session.user.id);
  return Response.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('POST session:', session);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'POST: Unauthorized' }, { status: 401 });
  }

  try {
    const data: CreateProjectDto = await req.json();
    const project = await ProjectService.createProject(data, session.user.id);
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project in api/projects/route.ts:', error);
    return Response.json(
      { error: 'Failed to create project in api/projects/route.ts' },
      { status: 500 }
    );
  }
} 