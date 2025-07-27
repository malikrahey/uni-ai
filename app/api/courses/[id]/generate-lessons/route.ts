import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createLesson } from '@/utils/database/education';
import { generateCourseOutline } from '@/utils/courses';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API Debug - Starting POST /api/courses/:id/generate-lessons');
    
    // Await params before using its properties (Next.js 15 requirement)
    const { id: courseId } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    console.log('Generating lessons for course ID:', courseId);

    // Verify user owns the course (either directly or through degree)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        degrees(
          id,
          name,
          description
        )
      `)
      .eq('id', courseId)
      .eq('user_id', user.id)
      .single();

    if (courseError || !course) {
      console.log('Course verification failed:', courseError);
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Check if lessons already exist
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    if (existingLessons && existingLessons.length > 0) {
      console.log('Lessons already exist for this course');
      return NextResponse.json(
        { error: 'Lessons already generated for this course' },
        { status: 400 }
      );
    }

    // Parse request body for generation options
    const body = await request.json().catch(() => ({}));
    const { forceRegenerate = false, lessonCount = 12 } = body;

    console.log('Generation options:', { forceRegenerate, lessonCount });

    // Generate lesson data using OpenAI
    const lessonTemplates = await generateCourseOutline(
      course.name,
      course.description,
      course.degrees?.name || 'General',
      lessonCount
    );
    
    const generatedLessons = [];
    let successCount = 0;

    // Create lessons in database
    for (let i = 0; i < lessonTemplates.length; i++) {
      const lessonTemplate = lessonTemplates[i];
      
      try {
        const lessonData = {
          name: lessonTemplate.name,
          description: lessonTemplate.description,
          icon: lessonTemplate.icon,
          content: '', // Will be generated when lesson is accessed
          course_id: courseId,
          lesson_order: i
        };

        const newLesson = await createLesson(lessonData, supabase);
        generatedLessons.push(newLesson);
        successCount++;
        
        console.log(`Created lesson ${i + 1}: ${lessonTemplate.name}`);
      } catch (error) {
        console.error(`Failed to create lesson ${i + 1}:`, error);
      }
    }

    console.log(`Successfully generated ${successCount} lessons`);

    return NextResponse.json({
      lessons: generatedLessons,
      generated: successCount,
      totalExpected: lessonTemplates.length,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/courses/:id/generate-lessons:', error);
    
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