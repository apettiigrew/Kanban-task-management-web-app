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

// Helper function to get next position for a new column
async function getNextColumnPosition(projectId: string) {
  const lastColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
  })
  return lastColumn ? lastColumn.position + 1 : 0
}

// GET /api/projects/[id]/columns - Get all columns for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)

    const { id: projectId } = validateSchema(validationSchemas.project.params, params) as { id: string }

    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    // Get all columns for the project
    const columns = await prisma.column.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    })

    return createSuccessResponse(columns)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/projects/[id]/columns - Create a new column for a specific project
export async function POST(
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
    const validatedData = validateSchema(validationSchemas.column.create, body) as { name: string; position?: number }

    // Get the position for the new column
    const position = validatedData.position ?? await getNextColumnPosition(projectId)

    // Create the column
    const column = await prisma.column.create({
      data: {
        name: validatedData.name,
        projectId,
        position,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return createSuccessResponse(column, 201, 'Column created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id]/columns - Update multiple columns (for reordering operations)
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
    const validatedData = validateSchema(validationSchemas.column.bulkUpdate, body) as { 
      columns: Array<{ id: string; name?: string; position?: number }> 
    }

    // Perform bulk updates in a transaction
    const updatedColumns = await prisma.$transaction(
      validatedData.columns.map(({ id, ...data }) =>
        prisma.column.update({
          where: { 
            id,
            projectId, // Ensure column belongs to this project
          },
          data,
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        })
      )
    )

    return createSuccessResponse(updatedColumns, 200, 'Columns updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
