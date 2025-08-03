import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createCourse } from '@/utils/database/education';
import { generateDegreeOutline } from '@/utils/courses';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: degreeId } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    // Parse request body
    const body = await request.json();
    const { forceRegenerate = false, courseCount = 8 } = body;

    // Verify the degree exists and belongs to the user
    const { data: degree, error: degreeError } = await supabase
      .from('degrees')
      .select('id, name')
      .eq('id', degreeId)
      .eq('user_id', user.id)
      .single();

    if (degreeError || !degree) {
      return NextResponse.json(
        { error: 'Degree not found or access denied' },
        { status: 404 }
      );
    }

    // Check if courses already exist
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('degree_id', degreeId);

    if (existingCourses && existingCourses.length > 0 && !forceRegenerate) {
      return NextResponse.json(
        { error: 'Courses already exist for this degree. Use forceRegenerate=true to regenerate.' },
        { status: 400 }
      );
    }

    // Get the next course order
    const { data: lastCourse } = await supabase
      .from('courses')
      .select('course_order')
      .eq('degree_id', degreeId)
      .order('course_order', { ascending: false })
      .limit(1);

    const nextOrder = lastCourse && lastCourse.length > 0 ? lastCourse[0].course_order + 1 : 0;

    // Generate course templates
    const courseTemplates = await generateDegreeOutline(
      degree.name,
      courseCount
    );

    // Create courses in database
    let successCount = 0;
    for (let i = 0; i < courseTemplates.length; i++) {
      const courseTemplate = courseTemplates[i];
      
      try {
        await createCourse({
          name: courseTemplate.name,
          description: courseTemplate.description,
          icon: courseTemplate.icon,
          degree_id: degreeId,
          is_standalone: false,
          user_id: user.id,
          course_order: nextOrder + i
        }, supabase);

        successCount++;
      } catch (error) {
        console.error(`Failed to create course ${i + 1}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      generated: successCount,
      message: `Successfully generated ${successCount} courses for degree: ${degree.name}`
    });

  } catch (error) {
    console.error('Error in POST /api/degrees/:id/generate-courses:', error);
    
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