import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { createCourse } from '@/utils/database/education';
import { generateDegreeOutline } from '@/utils/courses';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API Debug - Starting POST /api/degrees/:id/generate-courses');
    
    // Await params before using its properties (Next.js 15 requirement)
    const { id: degreeId } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    console.log('Generating courses for degree ID:', degreeId);

    // Verify user owns the degree
    const { data: degree, error: degreeError } = await supabase
      .from('degrees')
      .select('*')
      .eq('id', degreeId)
      .eq('user_id', user.id)
      .single();

    if (degreeError || !degree) {
      console.log('Degree verification failed:', degreeError);
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

    if (existingCourses && existingCourses.length > 0) {
      console.log('Courses already exist for this degree');
      return NextResponse.json(
        { error: 'Courses already generated for this degree' },
        { status: 400 }
      );
    }

    // Parse request body for generation options
    const body = await request.json().catch(() => ({}));
    const { forceRegenerate = false, courseCount = 8 } = body;

    console.log('Generation options:', { forceRegenerate, courseCount });

    // Generate course data using OpenAI
    const courseTemplates = await generateDegreeOutline(
      degree.name,
      degree.description,
      'comprehensive',
      courseCount
    );
    
    const generatedCourses = [];
    let successCount = 0;

    // Create courses in database
    for (let i = 0; i < courseTemplates.length; i++) {
      const courseTemplate = courseTemplates[i];
      
      try {
        const courseData = {
          name: courseTemplate.name,
          description: courseTemplate.description,
          icon: courseTemplate.icon,
          degree_id: degreeId,
          is_standalone: false,
          user_id: user.id,
          course_order: i
        };

        const newCourse = await createCourse(courseData, supabase);
        generatedCourses.push(newCourse);
        successCount++;
        
        console.log(`Created course ${i + 1}: ${courseTemplate.name}`);
      } catch (error) {
        console.error(`Failed to create course ${i + 1}:`, error);
      }
    }

    console.log(`Successfully generated ${successCount} courses`);

    return NextResponse.json({
      courses: generatedCourses,
      generated: successCount,
      totalExpected: courseTemplates.length,
      success: true
    }, { status: 201 });

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