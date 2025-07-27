import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { getDegreeById } from '@/utils/database/education';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties (Next.js 15 requirement)
    const { id } = await params;
    
    const { supabase, user } = await createAuthenticatedClient(request);

    // Get degree details
    const degreeDetail = await getDegreeById(id, user.id, supabase);

    return NextResponse.json({
      ...degreeDetail,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/degrees/[id]:', error);
    
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