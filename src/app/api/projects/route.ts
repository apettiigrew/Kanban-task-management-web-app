import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { CreateProjectDTO } from '@/models/project';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, title, description, created_at, updated_at 
       FROM projects 
       WHERE deleted_at IS NULL
       ORDER BY updated_at DESC`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateProjectDTO = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Insert project into database
    const result = await pool.query(
      `INSERT INTO projects (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [body.title, body.description]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 