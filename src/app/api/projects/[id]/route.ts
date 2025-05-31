import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProjectSchema } from '@/lib/validations/project'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit,
  NotFoundError 
} from '@/lib/api-error-handler'

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Basic rate limiting
    if (!checkRateLimit(`project-get-${id}`, 100)) {
      throw new Error('Rate limit exceeded')
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        columns: includeRelations ? {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          }
        } : false,
        tasks: includeRelations,
        _count: includeStats ? {
          select: {
            tasks: true,
            columns: true,
          }
        } : false,
      },
    })

    if (!project) {
      throw new NotFoundError('Project')
    }

    // Transform data to include stats if requested
    const { _count, ...projectData } = project
    const transformedProject = {
      ...projectData,
      ...(includeStats && _count ? {
        taskCount: _count.tasks,
        columnCount: _count.columns,
      } : {}),
    }

    return createSuccessResponse(transformedProject, 'Project fetched successfully')
  } catch (error) {
    const { id } = await params;
    return handleAPIError(error, `/api/projects/${id}`)
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Basic rate limiting
    if (!checkRateLimit(`project-put-${id}`, 20)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(updateProjectSchema, body)

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      throw new NotFoundError('Project')
    }

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            tasks: true,
            columns: true,
          }
        }
      }
    })

    // Transform to include stats
    const { _count, ...projectData } = project
    const transformedProject = {
      ...projectData,
      taskCount: _count.tasks,
      columnCount: _count.columns,
    }

    return createSuccessResponse(transformedProject, 'Project updated successfully')
  } catch (error) {
    const { id } = await params;
    return handleAPIError(error, `/api/projects/${id}`)
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Basic rate limiting
    if (!checkRateLimit(`project-delete-${id}`, 10)) {
      throw new Error('Rate limit exceeded')
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      throw new NotFoundError('Project')
    }

    // Delete the project (cascade deletion will handle related columns and tasks)
    await prisma.project.delete({
      where: { id },
    })

    return createSuccessResponse(undefined, 'Project deleted successfully')
  } catch (error) {
    const { id } = await params;
    return handleAPIError(error, `/api/projects/${id}`)
  }
}