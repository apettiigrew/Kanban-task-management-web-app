import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { handleApiError, requireAuth, validateSchema, parseRequestBody, createSuccessResponse } from '@/utils/api-error-handler'
import { validationSchemas } from '@/utils/validation-schemas'

// GET /api/projects - Get all projects for the authenticated user
export async function GET() {
  try {
    const session = await auth()
    requireAuth(session)

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return createSuccessResponse(projects)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    requireAuth(session)

    const body = await parseRequestBody(request)
    const validatedData = validateSchema(validationSchemas.project.create, body)

    const { name, description } = validatedData

    // Create the project with default columns
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        columns: {
          create: [
            { name: 'To Do', position: 0 },
            { name: 'In Progress', position: 1 },
            { name: 'Done', position: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return createSuccessResponse(project, 201, 'Project created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}