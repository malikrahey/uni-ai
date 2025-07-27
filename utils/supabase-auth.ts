import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

/**
 * Creates an authenticated Supabase client from a NextRequest
 * This client will have the proper authentication context for RLS policies
 */
export async function createAuthenticatedClient(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  // Extract token from Bearer header
  const token = authHeader.replace('Bearer ', '');

  // Create authenticated Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error(`Invalid token or user not found: ${userError?.message || 'No user found'}`);
  }

  return { supabase, user, token };
}

/**
 * Simple wrapper for when you just need the authenticated client
 */
export async function getAuthenticatedSupabase(request: NextRequest) {
  const { supabase } = await createAuthenticatedClient(request);
  return supabase;
} 