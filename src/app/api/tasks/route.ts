import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTaskSchema, reorderTasksSchema } from '@/lib/validations/task'
import { z } from 'zod'

// GET /api/tasks - Get all tasks (optionally filtered by project or column)
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
      },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = createTaskSchema.parse(body)

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    // Check if column exists and belongs to the project
    const column = await prisma.column.findUnique({
      where: { 
        id: validatedData.columnId,
        projectId: validatedData.projectId,
      },
    })

    if (!column) {
      return NextResponse.json(
        {
          success: false,
          error: 'Column not found or does not belong to the specified project',
        },
        { status: 404 }
      )
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

    return NextResponse.json(
      {
        success: true,
        data: task,
        message: 'Task created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating task:', error)
    
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
        error: 'Failed to create task',
      },
      { status: 500 }
    )
  }
}

// PUT /api/tasks - Reorder tasks within a column
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = reorderTasksSchema.parse(body)

    // Use a transaction to update all task orders atomically
    await prisma.$transaction(
      validatedData.taskOrders.map(({ id, order }) =>
        prisma.task.update({
          where: { id },
          data: { order },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Tasks reordered successfully',
    })
  } catch (error) {
    console.error('Error reordering tasks:', error)
    
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
        error: 'Failed to reorder tasks',
      },
      { status: 500 }
    )
  }
}
