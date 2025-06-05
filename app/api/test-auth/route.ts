import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test Auth API - Starting');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Test Auth - Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json({
        user: null,
        userError: 'Authorization header missing',
        session: null,
        sessionError: 'No authorization header',
        hasUser: false,
        hasSession: false,
        success: true,
        message: 'No authorization header provided'
      });
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    console.log('Test Auth - Token extracted, length:', token.length);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('Test Auth - User from token:', user);
    console.log('Test Auth - Error:', userError);
    
    // Also try to get session (this might not work with token-based auth)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Test Auth - Session:', session);
    console.log('Test Auth - Session Error:', sessionError);

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError ? userError.message : null,
      session: session ? { user_id: session.user?.id } : null,
      sessionError: sessionError ? sessionError.message : null,
      hasUser: !!user,
      hasSession: !!session,
      tokenLength: token.length,
      success: true
    });

  } catch (error) {
    console.error('Test Auth API Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
} 