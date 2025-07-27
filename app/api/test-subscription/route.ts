import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase-auth';
import { checkSubscriptionAccess, validateSubscriptionAccess } from '@/utils/subscription-check';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request);

    // Test subscription access check
    const status = await checkSubscriptionAccess(user.id, supabase);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscriptionStatus: status,
      canGenerateContent: status.canGenerateContent,
      hasActiveSubscription: status.hasActiveSubscription,
      hasValidTrial: status.hasValidTrial
    });

  } catch (error) {
    console.error('Error in GET /api/test-subscription:', error);
    
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

    // Test subscription validation (this will throw an error if user doesn't have access)
    try {
      const status = await validateSubscriptionAccess(user.id, supabase);
      
      return NextResponse.json({
        success: true,
        message: 'Subscription validation passed',
        user: {
          id: user.id,
          email: user.email
        },
        subscriptionStatus: status
      });

    } catch (validationError) {
      // Check if it's an authentication error
      if (validationError instanceof Error && validationError.message.includes('Authentication required')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Authentication required',
            message: 'Please log in to continue',
            code: 'AUTHENTICATION_REQUIRED',
            redirect: '/'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          success: false,
          error: 'Subscription validation failed',
          message: validationError instanceof Error ? validationError.message : 'Unknown validation error',
          code: 'SUBSCRIPTION_REQUIRED'
        },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('Error in POST /api/test-subscription:', error);
    
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