import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createCourse } from '@/utils/database/education';

// GET /api/courses - Get all courses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Get user's courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons(
          id,
          name,
          lesson_order
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      courses: courses || [],
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    
    if (error instanceof Error && error.message.includes('Authorization header missing')) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Invalid token')) {
      return NextResponse.json(
        { error: 'Invalid token or user not found', details: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Parse request body
    const body = await request.json();
    
    // Handle both old and new formats for backward compatibility
    const name = body.name || body.title;
    const description = body.description;
    const icon = body.icon;
    const degree_id = body.degree_id;
    const is_standalone = body.is_standalone ?? true; // Default to standalone for old format

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // If degree_id is provided, verify user owns the degree
    if (degree_id) {
      const { data: degree, error: degreeError } = await supabase
        .from('degrees')
        .select('id')
        .eq('id', degree_id)
        .eq('user_id', user.id)
        .single();

      if (degreeError || !degree) {
        return NextResponse.json(
          { error: 'Degree not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Get the next course order for degree courses
    let nextOrder = 0;
    if (degree_id) {
      const { data: existingCourses } = await supabase
        .from('courses')
        .select('course_order')
        .eq('degree_id', degree_id)
        .order('course_order', { ascending: false })
        .limit(1);

      nextOrder = existingCourses && existingCourses.length > 0 
        ? existingCourses[0].course_order + 1 
        : 0;
    }

    // Create the course
    const course = await createCourse({
      name,
      description,
      icon,
      degree_id,
      is_standalone: is_standalone ?? true,
      user_id: user.id,
      course_order: nextOrder
    }, supabase);

    return NextResponse.json({
      course,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/courses:', error);
    
    if (error instanceof Error && error.message.includes('Authorization header missing')) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Invalid token')) {
      return NextResponse.json(
        { error: 'Invalid token or user not found', details: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 