import { NextRequest } from "next/server"
import { createUser } from "@/lib/auth"
import { handleApiError, validateSchema, parseRequestBody, createSuccessResponse } from '@/utils/api-error-handler'
import { validationSchemas } from '@/utils/validation-schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request)
    const userData = validateSchema(validationSchemas.auth.signUp, body) as {
      email: string;
      password: string;
      name: string;
    }

    const { user, error } = await createUser(userData)

    if (error) {
      return createSuccessResponse(
        { error },
        400,
        'User creation failed'
      )
    }

    return createSuccessResponse(
      { 
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
        }
      },
      201,
      'User created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
