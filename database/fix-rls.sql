-- Fix RLS policies for course creation
-- Run this in your Supabase SQL editor to resolve the course creation issue

-- First, let's check if the policies exist
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('courses', 'course_subjects');

-- Check if RLS is enabled (compatible with all PostgreSQL versions)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('courses', 'course_subjects');

-- Check current authentication context
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as pg_user;

-- Debug: Check if auth functions are working
SELECT 
    auth.uid() IS NOT NULL as has_auth_uid,
    current_setting('request.jwt.claims', true)::json as jwt_claims;

-- Temporarily disable RLS to test (CAUTION: This is for debugging only)
-- Uncomment these lines if you want to temporarily disable RLS for testing:
-- ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_subjects DISABLE ROW LEVEL SECURITY;

-- OR, try recreating the policies with more explicit permissions
DROP POLICY IF EXISTS "Users can insert their own courses" ON courses;

-- Create a more permissive insert policy for testing
CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = user_id
    );

-- Test if you can insert directly (this should work if you're authenticated)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table
-- INSERT INTO courses (user_id, title, university, degree_type) 
-- VALUES (auth.uid(), 'Test Course', 'Test University', 'Test Degree');

-- Alternative approach: Create a more permissive policy for debugging
-- Uncomment these lines to create a temporary permissive policy:
/*
DROP POLICY IF EXISTS "Users can insert their own courses" ON courses;
CREATE POLICY "Allow all authenticated inserts" ON courses
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);
*/

-- To see what user ID you have, run this:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- After fixing the issue, remember to restore proper security:
/*
DROP POLICY IF EXISTS "Allow all authenticated inserts" ON courses;
CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
*/

-- If auth.uid() is returning NULL, the issue is with JWT token parsing
-- In that case, you may need to check your Supabase configuration 