import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTaskSchema, reorderTasksSchema } from '@/lib/validations/task'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit 
} from '@/lib/api-error-handler'

// GET /api/tasks - Get all tasks (optionally filtered by project or column)
export async function GET(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('tasks-get', 300)) {
      throw new Error('Rate limit exceeded')
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const columnId = searchParams.get('columnId')
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const whereClause: Record<string, string> = {}
    if (projectId) whereClause.projectId = projectId
    if (columnId) whereClause.columnId = columnId

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: includeRelations ? {
          select: {
            id: true,
            title: true,
            emoji: true,
          }
        } : false,
        column: includeRelations ? {
          select: {
            id: true,
            title: true,
          }
        } : false,
      },
      orderBy: [
        { columnId: 'asc' },
        { order: 'asc' }
      ],
    })

    return createSuccessResponse(tasks, 'Tasks fetched successfully')
  } catch (error) {
    return handleAPIError(error, '/api/tasks')
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('tasks-post', 100)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(createTaskSchema, body)

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Check if column exists and belongs to the project
    const column = await prisma.column.findUnique({
      where: { 
        id: validatedData.columnId,
        projectId: validatedData.projectId,
      },
    })

    if (!column) {
      throw new Error('Column not found or does not belong to the specified project')
    }

    // Get the next order number for this column
    const maxOrder = await prisma.task.aggregate({
      where: { columnId: validatedData.columnId },
      _max: { order: true },
    })

    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        order: nextOrder,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            emoji: true,
          }
        },
        column: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return createSuccessResponse(task, 'Task created successfully', 201)
  } catch (error) {
    return handleAPIError(error, '/api/tasks')
  }
}

// PUT /api/tasks - Reorder tasks within a column
export async function PUT(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('tasks-put', 50)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(reorderTasksSchema, body)

    // Use a transaction to update all task orders atomically
    await prisma.$transaction(
      validatedData.taskOrders.map(({ id, order }) =>
        prisma.task.update({
          where: { id },
          data: { order },
        })
      )
    )

    return createSuccessResponse(undefined, 'Tasks reordered successfully')
  } catch (error) {
    return handleAPIError(error, '/api/tasks')
  }
}
