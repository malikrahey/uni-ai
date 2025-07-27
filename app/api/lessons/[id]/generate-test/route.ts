import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createTest } from '@/utils/database/education';
import { generateCourseLesson } from '@/utils/courses';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API Debug - Starting POST /api/lessons/:id/generate-test');
    
    // Await params before using its properties (Next.js 15 requirement)
    const { id: lessonId } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    console.log('Generating test for lesson ID:', lessonId);

    // Verify user owns the lesson (through course ownership)
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        courses!inner(
          id,
          name,
          description,
          user_id,
          degrees(
            id,
            name,
            description
          )
        )
      `)
      .eq('id', lessonId)
      .eq('courses.user_id', user.id)
      .single();

    if (lessonError || !lesson) {
      console.log('Lesson verification failed:', lessonError);
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    // Check if lesson has content
    if (!lesson.content || lesson.content.trim().length < 100) {
      console.log('Lesson content is missing or too short');
      return NextResponse.json(
        { error: 'Lesson content must exist before generating test' },
        { status: 400 }
      );
    }

    // Generate test using OpenAI (we'll use the lesson content generation but only extract the test)
    const lessonContent = await generateCourseLesson(
      lesson.name,
      lesson.description,
      lesson.courses.name,
      lesson.courses.degrees?.name || 'General',
      lesson.lesson_order,
      'intermediate'
    );

    console.log('Generated test questions count:', lessonContent.test.questions.length);

    // Check if test already exists
    const { data: existingTest, error: testFetchError } = await supabase
      .from('tests')
      .select('id')
      .eq('lesson_id', lessonId)
      .single();

    if (testFetchError && testFetchError.code !== 'PGRST116') {
      console.error('Error checking for existing test:', testFetchError);
      return NextResponse.json(
        { error: 'Failed to check for existing test' },
        { status: 500 }
      );
    }

    let testOperation = '';
    let testId = '';

    if (existingTest) {
      // Update existing test
      testOperation = 'update';
      testId = existingTest.id;
      console.log('Updating existing test with ID:', existingTest.id);
      const { error: testUpdateError } = await supabase
        .from('tests')
        .update({
          questions: lessonContent.test.questions,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTest.id);

      if (testUpdateError) {
        console.error('Failed to update test:', testUpdateError);
        return NextResponse.json(
          { error: 'Failed to update test questions' },
          { status: 500 }
        );
      }
      console.log('Successfully updated test');
    } else {
      // Create new test
      testOperation = 'create';
      console.log('Creating new test for lesson:', lessonId);
      const { data: newTest, error: testCreateError } = await supabase
        .from('tests')
        .insert({
          lesson_id: lessonId,
          questions: lessonContent.test.questions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (testCreateError) {
        console.error('Failed to create test:', testCreateError);
        return NextResponse.json(
          { error: 'Failed to create test questions' },
          { status: 500 }
        );
      }
      testId = newTest.id;
      console.log('Successfully created test with ID:', newTest.id);
    }

    console.log(`Successfully generated test for lesson: ${lesson.name}`);
    console.log(`Test operation: ${testOperation}`);

    return NextResponse.json({
      testId,
      testQuestionsCount: lessonContent.test.questions.length,
      testOperation,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/lessons/:id/generate-test:', error);
    
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