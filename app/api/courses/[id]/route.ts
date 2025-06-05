import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/courses/[id] - Get a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
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

    const courseId = params.id;

    // Get the specific course with subjects
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_subjects (
          id,
          subject_name,
          credits,
          completed,
          semester,
          description,
          prerequisites,
          created_at
        )
      `)
      .eq('id', courseId)
      .eq('user_id', user?.id)
      .eq('is_deleted', false)
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching course:', courseError);
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      );
    }

    // Calculate progress
    const subjects = course.course_subjects || [];
    const totalSubjects = subjects.length;
    const completedSubjects = subjects.filter((subject: any) => subject.completed).length;
    const progress = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;

    const courseWithProgress = {
      ...course,
      progress,
      totalCourses: totalSubjects,
      completedCourses: completedSubjects
    };

    return NextResponse.json({
      course: courseWithProgress,
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update a specific course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;

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

    // Update the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update({
        title,
        university,
        degree_type,
        duration_years,
        start_date,
        target_graduation_date,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Error updating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      course,
      success: true,
      message: 'Course updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a specific course (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Soft delete the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting course:', courseError);
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 