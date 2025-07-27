import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Create a Supabase client for API routes
export function createApiSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Use the authorization header if available
      ...(authHeader && {
        autoRefreshToken: false,
        persistSession: false,
      }),
    },
    global: {
      headers: {
        // Forward the authorization header
        ...(authHeader && { authorization: authHeader }),
      },
    },
  });
}

// Alternative approach using cookies
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = createApiSupabaseClient(request);
    
    // Try to get user from the authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        return { user, error: null };
      }
    }
    
    // Fallback to session-based auth
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
} 