import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProjectSchema } from '@/lib/validations/project'
import { z } from 'zod'

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        columns: includeRelations ? {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          }
        } : false,
        tasks: includeRelations,
        _count: includeStats ? {
          select: {
            tasks: true,
            columns: true,
          }
        } : false,
      },
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

    // Transform data to include stats if requested
    const { _count, ...projectData } = project
    const transformedProject = {
      ...projectData,
      ...(includeStats && _count ? {
        taskCount: _count.tasks,
        columnCount: _count.columns,
      } : {}),
    }

    return NextResponse.json({
      success: true,
      data: transformedProject,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
      },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = updateProjectSchema.parse(body)

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            tasks: true,
            columns: true,
          }
        }
      }
    })

    // Transform to include stats
    const { _count, ...projectData } = project
    const transformedProject = {
      ...projectData,
      taskCount: _count.tasks,
      columnCount: _count.columns,
    }

    return NextResponse.json({
      success: true,
      data: transformedProject,
      message: 'Project updated successfully',
    })
  } catch (error) {
    console.error('Error updating project:', error)
    
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
        error: 'Failed to update project',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    // Delete the project (cascade deletion will handle related columns and tasks)
    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
      },
      { status: 500 }
    )
  }
}