import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG COURSE CREATION START ===');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);

    // Try with anon key first
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
    console.log('User from anon client:', user?.id, 'Error:', userError?.message);

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    // Test 1: Check if we can select from auth.users (this requires service role)
    console.log('\n=== TEST 1: Check auth context ===');
    const { data: authData, error: authError } = await supabaseAnon.rpc('auth.uid');
    console.log('auth.uid() result:', authData, 'Error:', authError?.message);

    // Test 2: Try to select from courses table
    console.log('\n=== TEST 2: Select from courses ===');
    const { data: existingCourses, error: selectError } = await supabaseAnon
      .from('courses')
      .select('*')
      .eq('user_id', user.id);
    console.log('Existing courses:', existingCourses?.length, 'Error:', selectError?.message);

    // Test 3: Try inserting with anon client
    console.log('\n=== TEST 3: Insert with anon client ===');
    const testCourse = {
      user_id: user.id,
      title: 'Debug Test Course',
      university: 'Test University',
      degree_type: 'Test Degree',
      duration_years: 4,
      start_date: new Date().toISOString(),
      description: 'Debug course for testing RLS',
      is_deleted: false
    };

    const { data: insertResult, error: insertError } = await supabaseAnon
      .from('courses')
      .insert(testCourse)
      .select()
      .single();

    console.log('Insert result:', insertResult?.id, 'Error:', insertError?.message);

    // Test 4: Try with service role if available
    let serviceRoleResult = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n=== TEST 4: Insert with service role ===');
      const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: serviceResult, error: serviceError } = await supabaseService
        .from('courses')
        .insert({
          ...testCourse,
          title: 'Debug Service Role Course'
        })
        .select()
        .single();

      serviceRoleResult = { data: serviceResult, error: serviceError };
      console.log('Service role result:', serviceResult?.id, 'Error:', serviceError?.message);
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: { id: user.id, email: user.email },
        userError: userError?.message || null,
        authData,
        authError: authError?.message || null,
        existingCourses: existingCourses?.length || 0,
        selectError: selectError?.message || null,
        insertResult: insertResult?.id || null,
        insertError: insertError?.message || null,
        serviceRoleResult: serviceRoleResult?.data?.id || null,
        serviceRoleError: serviceRoleResult?.error?.message || null,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
} 