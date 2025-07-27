-- Simple fix for course creation RLS issue
-- Run these commands one by one in your Supabase SQL editor

-- Step 1: Check what's currently happening
SELECT 'Step 1: Checking current state...' as step;

-- Check if you can see the auth.uid() value
SELECT auth.uid() as current_user_id;

-- Step 2: Temporarily create a more permissive policy
SELECT 'Step 2: Creating permissive policy...' as step;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own courses" ON courses;

-- Create a temporary policy that allows any authenticated user to insert
-- (We'll fix this later to be more secure)
CREATE POLICY "temp_allow_authenticated_inserts" ON courses
    FOR INSERT 
    TO authenticated
    WITH CHECK (user_id IS NOT NULL);

-- Step 3: Test the fix
SELECT 'Step 3: Policy created. Try creating a course now.' as step;

-- After testing, you can restore security with:
-- DROP POLICY IF EXISTS "temp_allow_authenticated_inserts" ON courses;
-- CREATE POLICY "Users can insert their own courses" ON courses
--     FOR INSERT WITH CHECK (auth.uid() = user_id); 