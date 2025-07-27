import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { validateSubscriptionAccess, getSubscriptionErrorMessage } from './subscription-check';

export interface AuthenticatedRequest {
  supabase: SupabaseClient;
  user: { id: string; [key: string]: any };
}

/**
 * Higher-order function that wraps API route handlers with subscription validation
 * Use this to protect API routes that require an active subscription
 */
export function withSubscriptionGuard<T extends AuthenticatedRequest>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      // Validate subscription access
      await validateSubscriptionAccess(context.user.id, context.supabase);
      
      // If validation passes, call the original handler
      return await handler(request, context);
      
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

      // Import dynamically to avoid circular dependencies
      const { checkSubscriptionAccess } = await import('./subscription-check');
      
      // Get detailed subscription status for better error messaging
      const status = await checkSubscriptionAccess(context.user.id, context.supabase);
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
  };
}

/**
 * Middleware function that can be used directly in API routes
 * Returns true if user has access, false otherwise
 */
export async function checkSubscriptionAccess(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string
): Promise<{ hasAccess: boolean; error?: NextResponse }> {
  try {
    await validateSubscriptionAccess(userId, supabase);
    return { hasAccess: true };
  } catch (subscriptionError) {
    // Check if it's an authentication error
    if (subscriptionError instanceof Error && subscriptionError.message.includes('Authentication required')) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please log in to continue',
          code: 'AUTHENTICATION_REQUIRED',
          redirect: '/'
        },
        { status: 401 }
      );
      
      return { hasAccess: false, error: errorResponse };
    }

    const { checkSubscriptionAccess: checkAccess } = await import('./subscription-check');
    const status = await checkAccess(userId, supabase);
    const errorMessage = getSubscriptionErrorMessage(status);
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Subscription required',
        message: errorMessage,
        code: 'SUBSCRIPTION_REQUIRED'
      },
      { status: 403 }
    );
    
    return { hasAccess: false, error: errorResponse };
  }
}

/**
 * Utility function to create a standardized subscription error response
 */
export function createSubscriptionErrorResponse(
  status: any,
  customMessage?: string
): NextResponse {
  const errorMessage = customMessage || getSubscriptionErrorMessage(status);
  
  return NextResponse.json(
    { 
      error: 'Subscription required',
      message: errorMessage,
      code: 'SUBSCRIPTION_REQUIRED'
    },
    { status: 403 }
  );
}

/**
 * Utility function to create a standardized authentication error response
 */
export function createAuthenticationErrorResponse(
  message: string = 'Please log in to continue'
): NextResponse {
  return NextResponse.json(
    { 
      error: 'Authentication required',
      message,
      code: 'AUTHENTICATION_REQUIRED',
      redirect: '/'
    },
    { status: 401 }
  );
} 