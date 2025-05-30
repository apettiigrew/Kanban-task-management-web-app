import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateColumnSchema } from '@/lib/validations/column'
import { z } from 'zod'

// GET /api/columns/[id] - Get a specific column
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
            emoji: true,
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
      return NextResponse.json(
        {
          success: false,
          error: 'Column not found',
        },
        { status: 404 }
      )
    }

    // Transform data to include task count
    const { _count, ...columnData } = column
    const transformedColumn = {
      ...columnData,
      taskCount: _count.tasks,
    }

    return NextResponse.json({
      success: true,
      data: transformedColumn,
    })
  } catch (error) {
    console.error('Error fetching column:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch column',
      },
      { status: 500 }
    )
  }
}

// PUT /api/columns/[id] - Update a specific column
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = updateColumnSchema.parse(body)

    // Check if column exists
    const existingColumn = await prisma.column.findUnique({
      where: { id: params.id },
    })

    if (!existingColumn) {
      return NextResponse.json(
        {
          success: false,
          error: 'Column not found',
        },
        { status: 404 }
      )
    }

    const column = await prisma.column.update({
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

    return NextResponse.json({
      success: true,
      data: transformedColumn,
      message: 'Column updated successfully',
    })
  } catch (error) {
    console.error('Error updating column:', error)
    
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
        error: 'Failed to update column',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/columns/[id] - Delete a specific column
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      return NextResponse.json(
        {
          success: false,
          error: 'Column not found',
        },
        { status: 404 }
      )
    }

    // Check if column has tasks
    if (existingColumn._count.tasks > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete column with tasks. Please move or delete all tasks first.',
        },
        { status: 400 }
      )
    }

    // Delete the column
    await prisma.column.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Column deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting column:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete column',
      },
      { status: 500 }
    )
  }
}