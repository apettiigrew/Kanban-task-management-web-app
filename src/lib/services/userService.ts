import bcrypt from 'bcryptjs';
import pool from '@/lib/database-postgresql';
import { CreateUserDto, User } from '@/models/user';

export class UserService {
  static async createUser(userData: CreateUserDto): Promise<User> {
    const { firstName, lastName, email, password } = userData;
    
    // First check if user exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    try {
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, hashed_password)
         VALUES ($1, $2, $3, $4)
         RETURNING id, first_name, last_name, email, created_at, updated_at`,
        [firstName, lastName, email, passwordHash]
      );
      
      const user = result.rows[0];
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      // Keep the existing unique constraint error handling as a fallback
      if (error instanceof Error && 'code' in error && error.code === '23505') { 
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
} 