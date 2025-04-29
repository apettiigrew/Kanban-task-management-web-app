import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<Response>;

export async function isAuthenticated(req: NextRequest) {
  const session = await getServerSession(authOptions);

  console.log('session data inside lib/auth.ts: ', session);

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null; // Authentication successful
}

export function withAuth(handler: RouteHandler): RouteHandler {
  return async function authHandler(req: NextRequest, ...args: any[]) {
    const authError = await isAuthenticated(req);
    
    if (authError) {
      return authError;
    }

    return handler(req, ...args);
  };
} 