import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createLesson } from '@/utils/database/education';
import type { CreateLessonForm } from '@/types/education';

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Parse request body
    const body = await request.json();
    const { name, description, icon, content, course_id }: CreateLessonForm = body;

    // Validate required fields
    if (!name || !description || !content || !course_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, content, course_id' },
        { status: 400 }
      );
    }

    // Verify user owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .eq('user_id', user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Get the next lesson order
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('lesson_order')
      .eq('course_id', course_id)
      .order('lesson_order', { ascending: false })
      .limit(1);

    const nextOrder = existingLessons && existingLessons.length > 0 
      ? existingLessons[0].lesson_order + 1 
      : 0;

    // Create the lesson
    const lesson = await createLesson({
      name,
      description,
      icon,
      content,
      course_id,
      lesson_order: nextOrder
    }, supabase);

    return NextResponse.json({
      lesson,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/lessons:', error);
    
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