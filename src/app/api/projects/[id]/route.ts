import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { handleApiError, requireAuth, validateSchema, parseRequestBody, createSuccessResponse, NotFoundError } from '@/utils/api-error-handler'
import { validationSchemas } from '@/utils/validation-schemas'

// Helper function to verify project ownership
async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: userId,
    },
  })

  if (!project) {
    throw new NotFoundError('Project not found or access denied')
  }

  return project
}

// GET /api/projects/[id] - Get a specific project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)

    const { id: projectId } = validateSchema(validationSchemas.project.params, params) as { id: string }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    if (!project) {
      throw new NotFoundError('Project not found')
    }

    return createSuccessResponse(project)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)

    const { id: projectId } = validateSchema(validationSchemas.project.params, params) as { id: string }
    
    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    const body = await parseRequestBody(request)
    const validatedData = validateSchema(validationSchemas.project.update, body) as { name?: string; description?: string }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return createSuccessResponse(updatedProject, 200, 'Project updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)

    const { id: projectId } = validateSchema(validationSchemas.project.params, params) as { id: string }
    
    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    // Delete the project (cascade delete will handle columns and tasks)
    await prisma.project.delete({
      where: { id: projectId },
    })

    return createSuccessResponse(
      { id: projectId }, 
      200, 
      'Project deleted successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
