import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/courses - Get all courses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('API Debug - Starting GET /api/courses');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('User from token:', user?.id, 'Error:', userError);
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'Invalid token or user not found', 
          details: userError?.message || 'No user found'
        },
        { status: 401 }
      );
    }

    console.log('Authenticated user ID:', user.id);

    // Get courses for the user
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        course_subjects (
          subject_name,
          credits,
          completed,
          semester
        )
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: coursesError.message },
        { status: 500 }
      );
    }

    console.log('Found courses:', courses?.length || 0);

    // Calculate progress for each course
    const coursesWithProgress = courses?.map(course => {
      const subjects = course.course_subjects || [];
      const totalSubjects = subjects.length;
      const completedSubjects = subjects.filter((subject: any) => subject.completed).length;
      const progress = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;

      return {
        ...course,
        progress,
        totalCourses: totalSubjects,
        completedCourses: completedSubjects
      };
    }) || [];

    return NextResponse.json({
      courses: coursesWithProgress,
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/courses:', error);
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
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('User from token:', user?.id, 'Error:', userError);
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'Invalid token or user not found', 
          details: userError?.message || 'No user found'
        },
        { status: 401 }
      );
    }

    console.log('Authenticated user ID for POST:', user.id);

    // Set the session for this client
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: user.user_metadata?.refresh_token || ''
    });

    if (sessionError) {
      console.log('Session error (non-fatal):', sessionError.message);
    }

    // Parse request body
    const body = await request.json();
    const { 
      title, 
      university, 
      degree_type, 
      duration_years, 
      start_date, 
      target_graduation_date,
      description 
    } = body;

    // Validate required fields
    if (!title || !university || !degree_type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, university, degree_type' },
        { status: 400 }
      );
    }

    // Try with service role if available, otherwise use regular client
    let dbClient = supabase;
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Using service role client');
      dbClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      console.log('Using authenticated anon client');
    }

    // Create the course
    console.log('About to create course with data:', {
      user_id: user.id,
      title,
      university,
      degree_type,
      duration_years: duration_years || 4
    });

    // First, let's test if we can select from the table
    const { data: testSelect, error: selectTestError } = await dbClient
      .from('courses')
      .select('id, user_id')
      .limit(1);
    
    console.log('Test select result:', testSelect?.length, 'Error:', selectTestError?.message);

    const { data: course, error: courseError } = await dbClient
      .from('courses')
      .insert({
        user_id: user.id,
        title,
        university,
        degree_type,
        duration_years: duration_years || 4,
        start_date: start_date || new Date().toISOString(),
        target_graduation_date,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      })
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      console.error('Full error details:', JSON.stringify(courseError, null, 2));
      
      // Try to provide more helpful error message
      let errorMessage = 'Failed to create course';
      if (courseError.code === '42501') {
        errorMessage += ' - Database permissions issue. Please run the emergency SQL fix to disable RLS temporarily.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: courseError.message,
          code: courseError.code,
          debug: {
            userId: user.id,
            hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            clientType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service' : 'anon'
          }
        },
        { status: 500 }
      );
    }

    // For now, we'll create a placeholder course structure
    const placeholderSubjects = [
      { subject_name: 'Introduction to ' + degree_type, credits: 3, semester: 1, completed: false },
      { subject_name: 'Mathematics Fundamentals', credits: 4, semester: 1, completed: false },
      { subject_name: 'Research Methods', credits: 3, semester: 2, completed: false },
      { subject_name: 'Advanced ' + degree_type, credits: 4, semester: 2, completed: false },
    ];

    // Insert placeholder subjects
    const { error: subjectsError } = await dbClient
      .from('course_subjects')
      .insert(
        placeholderSubjects.map(subject => ({
          course_id: course.id,
          ...subject,
          created_at: new Date().toISOString()
        }))
      );

    if (subjectsError) {
      console.error('Error creating course subjects:', subjectsError);
      // Don't fail the entire request, just log the error
    }

    return NextResponse.json({
      course: {
        ...course,
        progress: 0,
        totalCourses: placeholderSubjects.length,
        completedCourses: 0
      },
      success: true,
      message: 'Course created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 