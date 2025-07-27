'use client';

import { useRouter } from 'next/navigation';

export interface AuthErrorResponse {
  error: string;
  message: string;
  code: string;
  redirect?: string;
}

/**
 * Handle authentication errors from API responses
 * Redirects users to appropriate pages based on error type
 */
export function handleAuthError(error: AuthErrorResponse, router: ReturnType<typeof useRouter>) {
  console.error('Authentication error:', error);

  if (error.code === 'AUTHENTICATION_REQUIRED') {
    // Redirect to homepage for login
    router.push('/');
    return;
  }

  if (error.code === 'SUBSCRIPTION_REQUIRED') {
    // Redirect to payment page for subscription
    router.push('/pay');
    return;
  }

  // Default fallback - redirect to homepage
  router.push('/');
}

/**
 * Check if an API response indicates an authentication error
 */
export function isAuthError(response: any): response is AuthErrorResponse {
  return response && 
    typeof response === 'object' && 
    'code' in response && 
    (response.code === 'AUTHENTICATION_REQUIRED' || response.code === 'SUBSCRIPTION_REQUIRED');
}

/**
 * Handle API errors and redirect users appropriately
 */
export async function handleApiError(response: Response, router: ReturnType<typeof useRouter>) {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      
      if (isAuthError(errorData)) {
        handleAuthError(errorData, router);
        return;
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
    }
  }
}

/**
 * Hook for handling authentication errors in components
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleError = (error: AuthErrorResponse) => {
    handleAuthError(error, router);
  };

  const handleApiResponse = async (response: Response) => {
    await handleApiError(response, router);
  };

  return {
    handleError,
    handleApiResponse
  };
} 