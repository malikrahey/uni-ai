import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { markLessonComplete } from '@/utils/database/education';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties (Next.js 15 requirement)
    const { id } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

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
      .eq('id', id)
      .eq('courses.user_id', user.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    // Mark lesson as complete
    await markLessonComplete(id, user.id, supabase);

    return NextResponse.json({
      message: 'Lesson marked as complete',
      success: true
    });

  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/complete:', error);
    
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