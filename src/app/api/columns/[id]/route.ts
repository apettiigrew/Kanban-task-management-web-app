import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateColumnSchema } from '@/lib/validations/column'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit,
  NotFoundError 
} from '@/lib/api-error-handler'

// GET /api/columns/[id] - Get a specific column
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Basic rate limiting
    if (!checkRateLimit(`column-get-${params.id}`, 100)) {
      throw new Error('Rate limit exceeded')
    }

    const { searchParams } = new URL(request.url)
    const includeTasks = searchParams.get('includeTasks') === 'true'

    const column = await prisma.column.findUnique({
      where: { id: params.id },
      include: {
        tasks: includeTasks ? {
          orderBy: { order: 'asc' }
        } : false,
        project: {
          select: {
            id: true,
            title: true,
          }
        },
        _count: {
          select: {
            tasks: true,
          }
        }
      },
    })

    if (!column) {
      throw new NotFoundError('Column')
    }

    // Transform data to include task count
    const { _count, ...columnData } = column
    const transformedColumn = {
      ...columnData,
      taskCount: _count.tasks,
    }

    return createSuccessResponse(transformedColumn, 'Column fetched successfully')
  } catch (error) {
    return handleAPIError(error, `/api/columns/${params.id}`)
  }
}

// PUT /api/columns/[id] - Update a specific column
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Basic rate limiting
    if (!checkRateLimit(`column-put-${params.id}`, 20)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(updateColumnSchema, body)

    // Check if column exists
    const existingColumn = await prisma.column.findUnique({
      where: { id: params.id },
    })

    if (!existingColumn) {
      throw new NotFoundError('Column')
    }

    const column = await prisma.column.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            title: true,
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

    return createSuccessResponse(transformedColumn, 'Column updated successfully')
  } catch (error) {
    return handleAPIError(error, `/api/columns/${params.id}`)
  }
}

// DELETE /api/columns/[id] - Delete a specific column
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Basic rate limiting
    if (!checkRateLimit(`column-delete-${params.id}`, 10)) {
      throw new Error('Rate limit exceeded')
    }

    // Check if column exists
    const existingColumn = await prisma.column.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tasks: true,
          }
        }
      }
    })

    if (!existingColumn) {
      throw new NotFoundError('Column')
    }

    // Check if column has tasks
    if (existingColumn._count.tasks > 0) {
      throw new Error('Cannot delete column with tasks. Please move or delete all tasks first.')
    }

    // Delete the column
    await prisma.column.delete({
      where: { id: params.id },
    })

    return createSuccessResponse(undefined, 'Column deleted successfully')
  } catch (error) {
    return handleAPIError(error, `/api/columns/${params.id}`)
  }
}