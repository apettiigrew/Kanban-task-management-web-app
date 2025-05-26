import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { handleApiError, requireAuth, validateSchema, parseRequestBody, createSuccessResponse, NotFoundError } from '@/utils/api-error-handler'
import { validationSchemas } from '@/utils/validation-schemas'
import { prisma } from '@/lib/database'

// Helper function to verify column ownership
async function verifyColumnOwnership(projectId: string, columnId: string, userId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      projectId: projectId,
      project: {
        userId: userId,
      },
    },
    include: {
      project: true,
    },
  })

  if (!column) {
    throw new NotFoundError('Column not found or access denied')
  }

  return column
}

// GET /api/projects/[id]/columns/[columnId] - Get a specific column
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; columnId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, columnId } = validateSchema(validationSchemas.params.columnParams, params) as { id: string; columnId: string }

    // Verify column ownership
    await verifyColumnOwnership(projectId, columnId, session.user.id)

    // Get the column with task count
    const columnWithDetails = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { position: 'asc' },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return createSuccessResponse(columnWithDetails, 200, 'Column retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id]/columns/[columnId] - Update a specific column
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; columnId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, columnId } = validateSchema(validationSchemas.params.columnParams, params) as { id: string; columnId: string }
    const body = await parseRequestBody(request)
    const updateData = validateSchema(validationSchemas.column.update, body) as { name?: string; position?: number }

    // Verify column ownership
    await verifyColumnOwnership(projectId, columnId, session.user.id)

    // Update the column
    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return createSuccessResponse(updatedColumn, 200, 'Column updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/projects/[id]/columns/[columnId] - Delete a specific column
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; columnId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, columnId } = validateSchema(validationSchemas.params.columnParams, params) as { id: string; columnId: string }

    // Verify column ownership
    await verifyColumnOwnership(projectId, columnId, session.user.id)

    // Check if column has tasks
    const taskCount = await prisma.task.count({
      where: { columnId: columnId },
    })

    if (taskCount > 0) {
      // Move all tasks to the first available column in the project
      const firstColumn = await prisma.column.findFirst({
        where: {
          projectId: projectId,
          id: { not: columnId },
        },
        orderBy: { position: 'asc' },
      })

      if (firstColumn) {
        // Get the highest position in the target column
        const lastTask = await prisma.task.findFirst({
          where: { columnId: firstColumn.id },
          orderBy: { position: 'desc' },
        })
        const startPosition = lastTask ? lastTask.position + 1 : 0

        // Move all tasks to the first column
        const tasksToMove = await prisma.task.findMany({
          where: { columnId: columnId },
          orderBy: { position: 'asc' },
        })

        await prisma.$transaction(
          tasksToMove.map((task, index) =>
            prisma.task.update({
              where: { id: task.id },
              data: {
                columnId: firstColumn.id,
                position: startPosition + index,
              },
            })
          )
        )
      } else {
        // If no other columns exist, delete all tasks
        await prisma.task.deleteMany({
          where: { columnId: columnId },
        })
      }
    }

    // Delete the column
    await prisma.column.delete({
      where: { id: columnId },
    })

    // Reorder remaining columns
    const remainingColumns = await prisma.column.findMany({
      where: { projectId: projectId },
      orderBy: { position: 'asc' },
    })

    await prisma.$transaction(
      remainingColumns.map((column, index) =>
        prisma.column.update({
          where: { id: column.id },
          data: { position: index },
        })
      )
    )

    return createSuccessResponse(null, 200, 'Column deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}