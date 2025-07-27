import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Database Setup Check - Starting');
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['courses', 'course_subjects']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return NextResponse.json({
        error: 'Failed to check database tables',
        details: tablesError.message,
        success: false
      }, { status: 500 });
    }

    const existingTables = tables?.map(t => t.table_name) || [];
    const requiredTables = ['courses', 'course_subjects'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    console.log('Existing tables:', existingTables);
    console.log('Missing tables:', missingTables);

    if (missingTables.length > 0) {
      return NextResponse.json({
        tablesExist: false,
        existingTables,
        missingTables,
        message: 'Database tables need to be created',
        setupInstructions: 'Run the SQL schema from database/schema.sql in your Supabase dashboard',
        success: true
      });
    }

    // Check if RLS is enabled
    const { data: rlsInfo, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['courses', 'course_subjects']);

    if (rlsError) {
      console.log('Could not check RLS status:', rlsError.message);
    }

    return NextResponse.json({
      tablesExist: true,
      existingTables,
      missingTables: [],
      rlsEnabled: rlsInfo?.every(table => table.rowsecurity) || false,
      message: 'Database setup looks good!',
      success: true
    });

  } catch (error) {
    console.error('Database setup check error:', error);
    return NextResponse.json(
      { 
        error: 'Database setup check failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
} 