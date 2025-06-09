
import {
  createSuccessResponse,
  handleAPIError,
  NotFoundError,
  validateRequestBody
} from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { moveTaskSchema } from '@/lib/validations/task'
import { NextRequest } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
    
      const body = await request.json()
      // Validate the request body using centralized validation
      const validatedData = validateRequestBody(moveTaskSchema, body)
  
      // Check if task exists
      const existingTask = await prisma.card.findUnique({
        where: { id: validatedData.taskId },
      })
  
      if (!existingTask) {
        throw new NotFoundError('Task')
      }
    
      const task = await prisma.card.update({
        where: { id: validatedData.taskId },
        data: {
            columnId: validatedData.destinationColumnId,
            order: validatedData.destinationOrder
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
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
  
      return createSuccessResponse(task, 'Task updated successfully')
    } catch (error) {
        console.log('error', error)
      return handleAPIError(error, `/api/tasks/move`)
    }
  }