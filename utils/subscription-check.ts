import { SupabaseClient } from '@supabase/supabase-js';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  hasValidTrial: boolean;
  canGenerateContent: boolean;
  subscription?: {
    id: string;
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean | null;
  } | null;
  trial?: {
    trial_end_time: string;
    is_trial_used: boolean | null;
  } | null;
}

/**
 * Check if a user has an active subscription or valid trial
 * This is the primary function for validating subscription access
 */
export async function checkSubscriptionAccess(
  userId: string,
  supabase: SupabaseClient
): Promise<SubscriptionStatus> {
  try {
    // Validate that we have a valid user ID
    if (!userId) {
      throw new Error('Authentication required');
    }

    // Check for active subscription first
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription check error:', subError);
    }

    // Check if subscription is valid (not expired and not cancelled)
    const hasActiveSubscription = subscription && 
      ['active', 'trialing'].includes(subscription.status) && 
      new Date(subscription.current_period_end) > new Date() &&
      !(subscription.cancel_at_period_end ?? false);

    // If user has active subscription, skip trial check
    if (hasActiveSubscription && subscription) {
      return {
        hasActiveSubscription: true,
        hasValidTrial: false,
        canGenerateContent: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end
        }
      };
    }

    // Check for valid trial
    const { data: trial, error: trialError } = await supabase
      .from('user_trials')
      .select('trial_end_time, is_trial_used')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (trialError && trialError.code !== 'PGRST116') {
      console.error('Trial check error:', trialError);
    }

    const hasValidTrial = trial && 
      !(trial.is_trial_used ?? false) && 
      new Date(trial.trial_end_time) > new Date();

    return {
      hasActiveSubscription: false,
      hasValidTrial: hasValidTrial ?? false,
      canGenerateContent: hasValidTrial ?? false,
      subscription: null,
      trial: hasValidTrial && trial ? {
        trial_end_time: trial.trial_end_time,
        is_trial_used: trial.is_trial_used
      } : null
    };

  } catch (error) {
    console.error('Error checking subscription access:', error);
    
    // If it's an authentication error, re-throw it
    if (error instanceof Error && error.message.includes('Authentication required')) {
      throw error;
    }
    
    return {
      hasActiveSubscription: false,
      hasValidTrial: false,
      canGenerateContent: false
    };
  }
}

/**
 * Validate subscription access and throw error if user doesn't have access
 * Use this in API routes for consistent error handling
 */
export async function validateSubscriptionAccess(
  userId: string,
  supabase: SupabaseClient
): Promise<SubscriptionStatus> {
  const status = await checkSubscriptionAccess(userId, supabase);
  
  if (!status.canGenerateContent) {
    throw new Error('Subscription required for this action');
  }
  
  return status;
}

/**
 * Get user-friendly error message for subscription requirements
 */
export function getSubscriptionErrorMessage(status: SubscriptionStatus): string {
  if (status.hasActiveSubscription && status.subscription?.cancel_at_period_end) {
    return 'Your subscription has been cancelled and will end soon. Please reactivate your subscription to continue generating content.';
  }
  
  if (status.subscription && ['canceled', 'incomplete', 'incomplete_expired'].includes(status.subscription.status)) {
    return 'Your subscription has expired. Please renew your subscription to continue generating content.';
  }
  
  if (status.trial && status.trial.is_trial_used) {
    return 'Your trial period has ended. Please subscribe to continue generating content.';
  }
  
  if (status.trial && new Date(status.trial.trial_end_time) <= new Date()) {
    return 'Your trial period has expired. Please subscribe to continue generating content.';
  }
  
  return 'A subscription is required to generate lessons and degrees. Please subscribe to continue.';
} 