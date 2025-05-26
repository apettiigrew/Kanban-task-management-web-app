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

// Helper function to get next position in column
async function getNextPositionInColumn(columnId: string) {
  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { position: 'desc' },
  })
  return lastTask ? lastTask.position + 1 : 0
}

// GET /api/projects/[id]/tasks - Get all tasks for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId } = validateSchema(validationSchemas.params.projectParams, params) as { id: string }

    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      orderBy: [
        { column: { position: 'asc' } },
        { position: 'asc' },
      ],
    })

    return createSuccessResponse(tasks, 200, 'Tasks retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/projects/[id]/tasks - Create a new task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId } = validateSchema(validationSchemas.params.projectParams, params) as { id: string }
    const body = await parseRequestBody(request)
    const taskData = validateSchema(validationSchemas.task.create, body) as {
      title: string;
      description?: string;
      columnId: string;
      position?: number;
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    // Verify the column belongs to this project
    const column = await prisma.column.findFirst({
      where: {
        id: taskData.columnId,
        projectId: projectId,
      },
    })

    if (!column) {
      throw new NotFoundError('Column not found in this project')
    }

    // Get the position for the new task
    const position = taskData.position ?? await getNextPositionInColumn(taskData.columnId)

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        columnId: taskData.columnId,
        projectId,
        position,
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    })

    return createSuccessResponse(task, 201, 'Task created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id]/tasks - Update multiple tasks (for drag-and-drop operations)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    requireAuth(session)
    const { id: projectId } = validateSchema(validationSchemas.params.projectParams, params) as { id: string }
    const body = await parseRequestBody(request)
    const bulkData = validateSchema(validationSchemas.task.bulkUpdate, body) as {
      tasks: Array<{
        id: string;
        title?: string;
        description?: string;
        columnId?: string;
        position?: number;
      }>;
    }

    // Verify project ownership
    await verifyProjectOwnership(projectId, session.user.id)

    // Perform bulk updates in a transaction
    const updatedTasks = await prisma.$transaction(
      bulkData.tasks.map(({ id, ...data }) =>
        prisma.task.update({
          where: { 
            id,
            projectId, // Ensure task belongs to this project
          },
          data,
          include: {
            column: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        })
      )
    )

    return createSuccessResponse(updatedTasks, 200, 'Tasks updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
