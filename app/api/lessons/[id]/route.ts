import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { getLessonById, getTestByLessonId } from '@/utils/database/education';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties (Next.js 15 requirement)
    const { id } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    // Get lesson details
    const lesson = await getLessonById(id, user.id, supabase);

    // Also try fetching test directly for comparison
    let directTest = null;
    try {
      directTest = await getTestByLessonId(id, user.id);
    } catch (error) {
      console.log('Direct test fetch failed:', error);
    }

    console.log('API Debug - Lesson data comparison:', {
      lessonId: lesson?.id,
      hasTestViaJoin: !!lesson?.test,
      hasTestViaDirect: !!directTest,
      testIdViaJoin: lesson?.test?.id,
      testIdViaDirect: directTest?.id,
      testQuestionsViaJoin: lesson?.test?.questions?.length || 0,
      testQuestionsViaDirect: directTest?.questions?.length || 0
    });

    return NextResponse.json({
      lesson,
      debug: {
        directTest,
        hasTestViaJoin: !!lesson?.test,
        hasTestViaDirect: !!directTest
      },
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/lessons/[id]:', error);
    
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