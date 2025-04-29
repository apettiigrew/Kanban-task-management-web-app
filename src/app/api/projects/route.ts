import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getProjects, createProject } from '@/features/project/actions/project';

const GET = withAuth(async (req: NextRequest) => {
  const projects = await getProjects();
  return Response.json(projects);
});

const POST = withAuth(async (req: NextRequest) => {
  const data = await req.json();
  const result = await createProject(null, data);
  return Response.json(result);
});

export { GET, POST }; 