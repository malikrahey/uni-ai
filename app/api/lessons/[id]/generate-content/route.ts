import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCourseLesson } from '@/utils/courses';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API Debug - Starting POST /api/lessons/:id/generate-content');
    
    // Await params before using its properties (Next.js 15 requirement)
    const { id: lessonId } = await params;
    
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

    // Create Supabase client to verify auth
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create authenticated Supabase client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    
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

    console.log('Generating content for lesson ID:', lessonId);

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

    // Parse request body for generation options
    const body = await request.json().catch(() => ({}));
    const { forceRegenerate = false } = body;

    console.log('Generation options:', { forceRegenerate });

    // Check if content already exists (unless force regenerating)
    if (!forceRegenerate && lesson.content && lesson.content.trim() !== '') {
      console.log('Content already exists for this lesson');
      return NextResponse.json(
        { error: 'Content already generated for this lesson' },
        { status: 400 }
      );
    }

    if (forceRegenerate) {
      console.log('Force regenerating content and test');
    } else {
      console.log('Generating new content and test');
    }

    // Generate content and test using OpenAI
    const lessonContent = await generateCourseLesson(
      lesson.name,
      lesson.description,
      lesson.courses.name,
      lesson.courses.degrees?.name || 'General',
      lesson.lesson_order,
      'intermediate'
    );

    console.log('Generated content length:', lessonContent.content.length);
    console.log('Generated test questions count:', lessonContent.test.questions.length);

    // Update lesson with generated content
    const { data: updatedLesson, error: updateError } = await supabase
      .from('lessons')
      .update({
        content: lessonContent.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update lesson content:', updateError);
      return NextResponse.json(
        { error: 'Failed to save generated content' },
        { status: 500 }
      );
    }

    console.log('Successfully updated lesson content');

    // Create or update the test for this lesson
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
    if (existingTest) {
      // Update existing test
      testOperation = 'update';
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
      console.log('Successfully created test with ID:', newTest.id);
    }

    console.log(`Successfully generated content for lesson: ${lesson.name}`);
    console.log(`Test operation: ${testOperation}`);

    return NextResponse.json({
      lesson: updatedLesson,
      contentLength: lessonContent.content.length,
      testQuestionsCount: lessonContent.test.questions.length,
      testOperation,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/lessons/:id/generate-content:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 