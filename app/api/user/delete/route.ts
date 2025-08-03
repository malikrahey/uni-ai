import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Cancel any active Stripe subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing']);

    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        if (sub.stripe_subscription_id) {
          try {
            const response = await fetch('/api/stripe/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: sub.stripe_subscription_id }),
            });
            
            if (response.ok) {
              // Update subscription status in database
              await supabase
                .from('subscriptions')
                .update({ status: 'canceled' })
                .eq('stripe_subscription_id', sub.stripe_subscription_id);
            }
          } catch (error) {
            console.error('Failed to cancel Stripe subscription:', error);
          }
        }
      }
    }

    // 2. Soft delete user data (mark as deleted instead of actually deleting)
    const softDeletePromises = [
      // Mark courses as deleted
      supabase
        .from('courses')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark degrees as deleted
      supabase
        .from('degrees')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark lessons as deleted
      supabase
        .from('lessons')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark tests as deleted
      supabase
        .from('tests')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark user lesson progress as deleted
      supabase
        .from('user_lesson_progress')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark user trials as deleted
      supabase
        .from('user_trials')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark user preferences as deleted
      supabase
        .from('user_preferences')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId),
      
      // Mark subscriptions as deleted
      supabase
        .from('subscriptions')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    ];

    await Promise.all(softDeletePromises);

    return NextResponse.json({
      success: true,
      message: 'Account soft-deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/user/delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 