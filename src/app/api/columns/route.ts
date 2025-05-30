import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createColumnSchema, reorderColumnsSchema } from '@/lib/validations/column'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit 
} from '@/lib/api-error-handler'

// GET /api/columns - Get all columns (optionally filtered by project)
export async function GET(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('columns-get', 200)) {
      throw new Error('Rate limit exceeded')
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const includeTasks = searchParams.get('includeTasks') === 'true'

    const whereClause = projectId ? { projectId } : {}

    const columns = await prisma.column.findMany({
      where: whereClause,
      include: {
        tasks: includeTasks ? {
          orderBy: { order: 'asc' }
        } : false,
        project: {
          select: {
            id: true,
            title: true,
            emoji: true,
          }
        },
        _count: {
          select: {
            tasks: true,
          }
        }
      },
      orderBy: [
        { projectId: 'asc' },
        { order: 'asc' }
      ],
    })

    // Transform data to include task count
    const transformedColumns = columns.map(column => {
      const { _count, ...columnData } = column
      return {
        ...columnData,
        taskCount: _count.tasks,
      }
    })

    return createSuccessResponse(transformedColumns, 'Columns fetched successfully')
  } catch (error) {
    return handleAPIError(error, '/api/columns')
  }
}

// POST /api/columns - Create a new column
export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('columns-post', 50)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(createColumnSchema, body)

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Get the next order number for this project
    const maxOrder = await prisma.column.aggregate({
      where: { projectId: validatedData.projectId },
      _max: { order: true },
    })

    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const column = await prisma.column.create({
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
        _count: {
          select: {
            tasks: true,
          }
        }
      }
    })

    // Transform to include task count
    const { _count, ...columnData } = column
    const transformedColumn = {
      ...columnData,
      taskCount: _count.tasks,
    }

    return createSuccessResponse(transformedColumn, 'Column created successfully', 201)
  } catch (error) {
    return handleAPIError(error, '/api/columns')
  }
}

// PUT /api/columns - Reorder columns
export async function PUT(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('columns-put', 30)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(reorderColumnsSchema, body)

    // Use a transaction to update all column orders atomically
    await prisma.$transaction(
      validatedData.columnOrders.map(({ id, order }) =>
        prisma.column.update({
          where: { id },
          data: { order },
        })
      )
    )

    return createSuccessResponse(undefined, 'Columns reordered successfully')
  } catch (error) {
    return handleAPIError(error, '/api/columns')
  }
}