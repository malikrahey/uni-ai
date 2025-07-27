'use client';

import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import Link from 'next/link';

interface SubscriptionUpgradePromptProps {
  title?: string;
  message?: string;
  showTrialInfo?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'banner';
}

export function SubscriptionUpgradePrompt({
  title = 'Subscription Required',
  message,
  showTrialInfo = true,
  className = '',
  variant = 'default'
}: SubscriptionUpgradePromptProps) {
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const { isInTrial, trialEndTime, isLoading: isTrialLoading } = useTrialStatus();
  const { getErrorMessage } = useSubscriptionGuard();

  const isLoading = isSubscriptionLoading || isTrialLoading;

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Don't show if user has access
  if ((subscription?.status === 'active' || subscription?.status === 'trialing') || isInTrial) {
    return null;
  }

  const displayMessage = message || getErrorMessage();

  if (variant === 'compact') {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">{title}</p>
            <p className="text-xs text-yellow-700 mt-1">{displayMessage}</p>
          </div>
          <Link
            href="/pay"
            className="ml-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-blue-100 mt-1">{displayMessage}</p>
            {showTrialInfo && isInTrial && trialEndTime && (
              <p className="text-blue-100 text-sm mt-2">
                Trial ends: {new Date(trialEndTime).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            href="/pay"
            className="ml-4 bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Subscribe Now
          </Link>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{displayMessage}</p>
        
        {showTrialInfo && isInTrial && trialEndTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Trial Period:</strong> Your trial ends on{' '}
              {new Date(trialEndTime).toLocaleDateString()}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pay"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Subscribe Now
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Account
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Component for showing subscription status in a compact format
 */
export function SubscriptionStatusBadge() {
  const { subscription, isLoading } = useSubscription();
  const { isInTrial } = useTrialStatus();

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Loading...
      </span>
    );
  }

  if (subscription?.status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  }

  if (subscription?.status === 'trialing') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Trial
      </span>
    );
  }

  if (isInTrial) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Free Trial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      No Subscription
    </span>
  );
} 