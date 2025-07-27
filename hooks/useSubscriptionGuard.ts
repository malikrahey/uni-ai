'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useRouter } from 'next/navigation';

export interface SubscriptionGuardResult {
  canGenerateContent: boolean;
  isLoading: boolean;
  error: string | null;
  checkAccess: () => Promise<boolean>;
  redirectToUpgrade: () => void;
  redirectToLogin: () => void;
  getErrorMessage: () => string;
}

/**
 * Hook for checking subscription access on the client side
 * Use this in components that need to validate subscription before allowing actions
 */
export function useSubscriptionGuard(): SubscriptionGuardResult {
  const { user } = useAuth();
  const { subscription, isLoading: isSubscriptionLoading, error: subscriptionError } = useSubscription();
  const { isInTrial, isLoading: isTrialLoading } = useTrialStatus();
  const router = useRouter();

  const isLoading = isSubscriptionLoading || isTrialLoading;

  // Check if user can generate content
  const canGenerateContent = !isLoading && !!user && (
    (subscription?.status === 'active' || subscription?.status === 'trialing') ||
    !!isInTrial
  );

  // Function to check access programmatically
  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    // Wait for loading to complete
    if (isLoading) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(!!canGenerateContent);
          }
        }, 100);
      });
    }

    return !!canGenerateContent;
  }, [user, isLoading, canGenerateContent]);

  // Function to redirect to upgrade page
  const redirectToUpgrade = useCallback(() => {
    router.push('/pay');
  }, [router]);

  // Function to redirect to login page
  const redirectToLogin = useCallback(() => {
    router.push('/');
  }, [router]);

  // Function to get user-friendly error message
  const getErrorMessage = useCallback((): string => {
    if (!user) {
      return 'Please log in to continue.';
    }

    if (subscriptionError) {
      return 'Unable to verify subscription status. Please try again.';
    }

    if (subscription?.status === 'canceled' || subscription?.status === 'incomplete_expired') {
      return 'Your subscription has expired. Please renew to continue generating content.';
    }

    if (subscription?.cancel_at_period_end) {
      return 'Your subscription has been cancelled and will end soon. Please reactivate to continue generating content.';
    }

    if (!isInTrial && !subscription) {
      return 'A subscription is required to generate lessons and degrees. Please subscribe to continue.';
    }

    return 'Subscription required for this action. Please upgrade your account.';
  }, [user, subscription, subscriptionError, isInTrial]);

  return {
    canGenerateContent: !!canGenerateContent,
    isLoading,
    error: subscriptionError,
    checkAccess,
    redirectToUpgrade,
    redirectToLogin,
    getErrorMessage
  };
}

/**
 * Hook for protecting components that require subscription
 * Automatically redirects to upgrade page if user doesn't have access
 */
export function useSubscriptionProtected() {
  const { canGenerateContent, isLoading, redirectToUpgrade, redirectToLogin, getErrorMessage } = useSubscriptionGuard();

  const requireSubscription = useCallback(() => {
    if (!isLoading && !canGenerateContent) {
      // Check if user is not logged in
      if (!canGenerateContent && !isLoading) {
        redirectToLogin();
        return false;
      }
      redirectToUpgrade();
      return false;
    }
    return true;
  }, [canGenerateContent, isLoading, redirectToUpgrade, redirectToLogin]);

  return {
    canGenerateContent,
    isLoading,
    requireSubscription,
    getErrorMessage
  };
} 