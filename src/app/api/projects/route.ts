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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description } = body;

    // Validate required fields
    if (!id || !title) {
      return NextResponse.json(
        { error: 'Project id and title are required' },
        { status: 400 }
      );
    }

    console.log("backend route is being called");
    // Update project in database
    const result = await pool.query(
      `UPDATE projects
       SET title = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING id, title, description, created_at, updated_at`,
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  try {
    const result = await pool.query(
      `UPDATE projects 
       SET deleted_at = NOW() 
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
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