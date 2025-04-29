import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getProject, updateProject, deleteProject } from '@/features/project/actions/project';

const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const project = await getProject(params.id);
  return Response.json(project);
});

const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const data = await req.json();
  const result = await updateProject(params.id, data);
  return Response.json(result);
});

const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const result = await deleteProject(null, new FormData());
  return Response.json(result);
});

export const dynamic = 'force-dynamic';
export { GET, PUT, DELETE }; 