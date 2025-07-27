import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { getUserDegrees, createDegree } from '@/utils/database/education';
import { validateSubscriptionAccess, getSubscriptionErrorMessage } from '@/utils/subscription-check';
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
        { 
          error: 'Authorization header missing',
          message: 'Please log in to continue',
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Invalid token')) {
      return NextResponse.json(
        { 
          error: 'Invalid token or user not found',
          message: 'Please log in to continue',
          details: error.message,
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
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

    // Validate subscription access before allowing degree creation
    try {
      await validateSubscriptionAccess(user.id, supabase);
    } catch (subscriptionError) {
      // Check if it's an authentication error
      if (subscriptionError instanceof Error && subscriptionError.message.includes('Authentication required')) {
        return NextResponse.json(
          { 
            error: 'Authentication required',
            message: 'Please log in to continue',
            code: 'AUTHENTICATION_REQUIRED',
            redirect: '/'
          },
          { status: 401 }
        );
      }

      // Get detailed subscription status for better error messaging
      const { checkSubscriptionAccess } = await import('@/utils/subscription-check');
      const status = await checkSubscriptionAccess(user.id, supabase);
      const errorMessage = getSubscriptionErrorMessage(status);
      
      return NextResponse.json(
        { 
          error: 'Subscription required',
          message: errorMessage,
          code: 'SUBSCRIPTION_REQUIRED'
        },
        { status: 403 }
      );
    }

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
        { 
          error: 'Authorization header missing',
          message: 'Please log in to continue',
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Invalid token')) {
      return NextResponse.json(
        { 
          error: 'Invalid token or user not found',
          message: 'Please log in to continue',
          details: error.message,
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 