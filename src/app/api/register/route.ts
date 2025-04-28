import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { z } from 'zod';

// Input validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request, response: Response) {
  try {
    const body = await request.json();
    
    console.log('body on the server', body);
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Create user
    const user = await UserService.createUser(validatedData);
    
    // Return success response without password
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }
    
    if (error instanceof Error && error.message === 'Email already exists') {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
      }, { status: 409 });
    }
    
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
} 