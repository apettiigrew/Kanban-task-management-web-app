import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bulkUpdateTasksSchema } from '@/lib/validations/task'
import { z } from 'zod'

// PUT /api/tasks/bulk - Bulk update tasks (for moving between columns)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = bulkUpdateTasksSchema.parse(body)

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

    return NextResponse.json({
      success: true,
      message: 'Tasks updated successfully',
    })
  } catch (error) {
    console.error('Error bulk updating tasks:', error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bulk update tasks',
      },
      { status: 500 }
    )
  }
}
