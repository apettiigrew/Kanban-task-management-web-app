import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { Prisma } from '@prisma/client'

// Standard error response interface
export interface ApiErrorResponse {
  error: string
  details?: Array<{
    field: string
    message: string
  }> | unknown
  code?: string
  timestamp?: string
}

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed', public details?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

// Main error handler function
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  const timestamp = new Date().toISOString()

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

    return NextResponse.json(
      {
        error: 'Validation failed',
        details,
        code: 'VALIDATION_ERROR',
        timestamp,
      },
      { status: 400 }
    )
  }

  // Handle custom application errors
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'AUTHENTICATION_ERROR',
        timestamp,
      },
      { status: 401 }
    )
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'AUTHORIZATION_ERROR',
        timestamp,
      },
      { status: 403 }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'NOT_FOUND_ERROR',
        timestamp,
      },
      { status: 404 }
    )
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'CONFLICT_ERROR',
        timestamp,
      },
      { status: 409 }
    )
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        code: 'VALIDATION_ERROR',
        timestamp,
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'A record with this information already exists',
            code: 'DUPLICATE_RECORD',
            timestamp,
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            code: 'RECORD_NOT_FOUND',
            timestamp,
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: 'Foreign key constraint failed',
            code: 'FOREIGN_KEY_CONSTRAINT',
            timestamp,
          },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          {
            error: 'Database operation failed',
            code: 'DATABASE_ERROR',
            timestamp,
          },
          { status: 500 }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Invalid data provided',
        code: 'PRISMA_VALIDATION_ERROR',
        timestamp,
      },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        code: 'DATABASE_CONNECTION_ERROR',
        timestamp,
      },
      { status: 503 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp,
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      timestamp,
    },
    { status: 500 }
  )
}

// Helper function for authentication checks
export function requireAuth(session: unknown): asserts session is { user: { id: string } } {
  if (!session || typeof session !== 'object' || !('user' in session) || 
      !session.user || typeof session.user !== 'object' || 
      !('id' in session.user) || typeof session.user.id !== 'string') {
    throw new AuthenticationError('Authentication required')
  }
}

// Helper function for validation  
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw result.error
  }
  return result.data
}

// Helper function for JSON parsing with error handling
export async function parseRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError('Invalid JSON in request body')
  }
}

// Helper function to create success responses
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<{ data: T; message?: string; timestamp: string }> {
  return NextResponse.json(
    {
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
