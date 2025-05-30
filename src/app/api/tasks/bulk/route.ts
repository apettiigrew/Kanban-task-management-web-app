import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bulkUpdateTasksSchema } from '@/lib/validations/task'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit 
} from '@/lib/api-error-handler'

// PUT /api/tasks/bulk - Bulk update tasks (for moving between columns)
export async function PUT(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('tasks-bulk-put', 10)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using centralized validation
    const validatedData = validateRequestBody(bulkUpdateTasksSchema, body)

    // Use a transaction to update all tasks atomically
    await prisma.$transaction(
      validatedData.tasks.map(({ id, columnId, order }) =>
        prisma.task.update({
          where: { id },
          data: {
            ...(columnId && { columnId }),
            ...(order !== undefined && { order }),
          },
        })
      )
    )

    return createSuccessResponse(null, 'Tasks updated successfully')
  } catch (error) {
    return handleAPIError(error, '/api/tasks/bulk')
  }
}
