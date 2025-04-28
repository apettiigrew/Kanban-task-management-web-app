'use server';

import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterFormState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function registerUser(
  prevState: RegisterFormState | undefined,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = registerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid form data',
    };
  }

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        errors: {
          _form: [data.error || 'Registration failed'],
        },
      };
    }

    return {
      message: 'Registration successful!',
    };
  } catch (error) {
    return {
      errors: {
        _form: ['An unexpected error occurred'],
      },
    };
  }
} 