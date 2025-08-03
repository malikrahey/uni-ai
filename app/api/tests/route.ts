import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { getTestByLessonId } from '@/utils/database/education';
import { createTest } from '@/utils/database/education';
import type { CreateTestForm } from '@/types/education';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Get lesson_id from query parameters
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lesson_id');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lesson_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user owns the lesson and get the test
    const test = await getTestByLessonId(lessonId, user.id, supabase);

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      test,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/tests:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Parse request body
    const body = await request.json();
    const { lesson_id, questions }: CreateTestForm = body;

    // Validate required fields
    if (!lesson_id || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: lesson_id, questions (must be non-empty array)' },
        { status: 400 }
      );
    }

    // Verify user owns the lesson (through course ownership)
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        courses!inner(
          id,
          user_id
        )
      `)
      .eq('id', lesson_id)
      .eq('courses.user_id', user.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    // Validate question format
    for (const question of questions) {
      if (!question.question || !question.answerType || typeof question.answer !== 'number') {
        return NextResponse.json(
          { error: 'Invalid question format. Each question must have: question, answerType, answer' },
          { status: 400 }
        );
      }
      
      if (question.answerType === 'multiple choice' && (!question.options || !Array.isArray(question.options))) {
        return NextResponse.json(
          { error: 'Multiple choice questions must include options array' },
          { status: 400 }
        );
      }
    }

    // Create the test
    const test = await createTest({
      lesson_id,
      questions
    }, supabase);

    return NextResponse.json({
      test,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/tests:', error);
    
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