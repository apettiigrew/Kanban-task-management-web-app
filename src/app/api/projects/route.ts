import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validations/project'
import { z } from 'zod'

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const projects = await prisma.project.findMany({
      include: {
        columns: includeRelations,
        tasks: includeRelations ? {
          select: {
            id: true,
            title: true,
            order: true,
            columnId: true,
            createdAt: true,
          }
        } : false,
        _count: includeStats ? {
          select: {
            tasks: true,
            columns: true,
          }
        } : false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transform data to include stats if requested
    const transformedProjects = projects.map(project => {
      const { _count, ...projectData } = project
      return {
        ...projectData,
        ...(includeStats && _count ? {
          taskCount: _count.tasks,
          columnCount: _count.columns,
        } : {}),
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedProjects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
      },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body using Zod
    const validatedData = createProjectSchema.parse(body)

    const project = await prisma.project.create({
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

    return NextResponse.json(
      {
        success: true,
        data: transformedProject,
        message: 'Project created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    
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
        error: 'Failed to create project',
      },
      { status: 500 }
    )
  }
}