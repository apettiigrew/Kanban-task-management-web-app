import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validations/project'
import { 
  handleAPIError, 
  createSuccessResponse, 
  validateRequestBody,
  checkRateLimit 
} from '@/lib/api-error-handler'

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('projects-get', 200)) {
      throw new Error('Rate limit exceeded')
    }

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

    return createSuccessResponse(transformedProjects, 'Projects fetched successfully')
  } catch (error) {
    return handleAPIError(error, '/api/projects')
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting
    if (!checkRateLimit('projects-post', 50)) {
      throw new Error('Rate limit exceeded')
    }

    const body = await request.json()
    
    // Validate the request body using our validation helper
    const validatedData = validateRequestBody(createProjectSchema, body)

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

    return createSuccessResponse(
      transformedProject,
      'Project created successfully',
      201
    )
  } catch (error) {
    return handleAPIError(error, '/api/projects')
  }
}