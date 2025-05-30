import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTaskSchema } from '@/lib/validations/task'
import { z } from 'zod'

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
    })

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch task',
      },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = updateTaskSchema.parse(body)

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      )
    }

    // If columnId is being updated, verify the new column exists and belongs to the same project
    if (validatedData.columnId && validatedData.columnId !== existingTask.columnId) {
      const newColumn = await prisma.column.findUnique({
        where: { 
          id: validatedData.columnId,
          projectId: existingTask.projectId,
        },
      })

      if (!newColumn) {
        return NextResponse.json(
          {
            success: false,
            error: 'Column not found or does not belong to the same project',
          },
          { status: 404 }
        )
      }
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    })
  } catch (error) {
    console.error('Error updating task:', error)
    
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
        error: 'Failed to update task',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      )
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete task',
      },
      { status: 500 }
    )
  }
}
