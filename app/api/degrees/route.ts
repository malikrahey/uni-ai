import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { getUserDegrees, createDegree } from '@/utils/database/education';
import type { CreateDegreeForm } from '@/types/education';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Get user's degrees - pass authenticated client
    const degrees = await getUserDegrees(user.id, supabase);

    return NextResponse.json({
      degrees,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/degrees:', error);
    
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
    const { name, description, icon }: CreateDegreeForm = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Create the degree with user_id added - pass authenticated client
    const degreeData = {
      name,
      description,
      icon,
      user_id: user.id
    };

    const degree = await createDegree(degreeData, supabase);

    return NextResponse.json({
      degree,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/degrees:', error);
    
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