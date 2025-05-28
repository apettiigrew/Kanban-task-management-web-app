import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { handleApiError, requireAuth, validateSchema, parseRequestBody, createSuccessResponse, NotFoundError } from '@/utils/api-error-handler'
import { validationSchemas } from '@/utils/validation-schemas'

// Helper function to verify project and task ownership
async function verifyTaskOwnership(projectId: string, taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId: projectId,
      project: {
        userId: userId,
      },
    },
    include: {
      project: true,
    },
  })

  if (!task) {
    throw new NotFoundError('Task not found or access denied')
  }

  return task
}

// GET /api/projects/[id]/tasks/[taskId] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, taskId } = validateSchema(validationSchemas.params.taskParams, params) as { id: string; taskId: string }

    // Verify task ownership
    await verifyTaskOwnership(projectId, taskId, session.user.id)

    // Get the task with column information
    const taskWithDetails = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return createSuccessResponse(taskWithDetails, 200, 'Task retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id]/tasks/[taskId] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, taskId } = validateSchema(validationSchemas.params.taskParams, params) as { id: string; taskId: string }
    const body = await parseRequestBody(request)
    const updateData = validateSchema(validationSchemas.task.update, body) as {
      title?: string;
      description?: string;
      columnId?: string;
      position?: number;
    }

    // Verify task ownership
    await verifyTaskOwnership(projectId, taskId, session.user.id)

    // If columnId is being updated, verify it belongs to the same project
    if (updateData.columnId) {
      const column = await prisma.column.findFirst({
        where: {
          id: updateData.columnId,
          projectId: projectId,
        },
      })

      if (!column) {
        throw new NotFoundError('Column not found in this project')
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return createSuccessResponse(updatedTask, 200, 'Task updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/projects/[id]/tasks/[taskId] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId, taskId } = validateSchema(validationSchemas.params.taskParams, params) as { id: string; taskId: string }

    // Verify task ownership
    await verifyTaskOwnership(projectId, taskId, session.user.id)

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    })

    return createSuccessResponse(null, 200, 'Task deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}