import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createCourse } from '@/utils/database/education';

// GET /api/courses - Get all courses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('API Debug - Starting GET /api/courses');
    
    const { supabase, user } = await createAuthenticatedClient(request);

    console.log('Authenticated user ID:', user.id);

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
    console.log('API Debug - Starting POST /api/courses');
    
    const { supabase, user } = await createAuthenticatedClient(request);

    console.log('Authenticated user ID for POST:', user.id);

    // Parse request body
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Handle both old and new formats for backward compatibility
    const name = body.name || body.title;
    const description = body.description;
    const icon = body.icon;
    const degree_id = body.degree_id;
    const is_standalone = body.is_standalone ?? true; // Default to standalone for old format

    console.log('Parsed fields:', { name, description, icon, degree_id, is_standalone });

    // Validate required fields
    if (!name || !description) {
      console.log('Validation failed - missing required fields:', { name: !!name, description: !!description });
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    console.log('Validation passed - proceeding with course creation');

    // If degree_id is provided, verify user owns the degree
    if (degree_id) {
      console.log('Checking degree ownership for degree_id:', degree_id);
      const { data: degree, error: degreeError } = await supabase
        .from('degrees')
        .select('id')
        .eq('id', degree_id)
        .eq('user_id', user.id)
        .single();

      console.log('Degree check result:', { degree, degreeError });

      if (degreeError || !degree) {
        console.log('Degree validation failed');
        return NextResponse.json(
          { error: 'Degree not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Get the next course order for degree courses
    let nextOrder = 0;
    if (degree_id) {
      console.log('Getting next course order for degree:', degree_id);
      const { data: existingCourses } = await supabase
        .from('courses')
        .select('course_order')
        .eq('degree_id', degree_id)
        .order('course_order', { ascending: false })
        .limit(1);

      nextOrder = existingCourses && existingCourses.length > 0 
        ? existingCourses[0].course_order + 1 
        : 0;
      console.log('Next course order:', nextOrder);
    }

    // Create the course
    console.log('Creating course with data:', {
      name,
      description,
      icon,
      degree_id,
      is_standalone: is_standalone ?? true,
      user_id: user.id,
      course_order: nextOrder
    });

    const course = await createCourse({
      name,
      description,
      icon,
      degree_id,
      is_standalone: is_standalone ?? true,
      user_id: user.id,
      course_order: nextOrder
    }, supabase);

    console.log('Course created successfully:', course.id);

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