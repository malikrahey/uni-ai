-- WEBHOOK FIX: Create missing user records for existing users
-- This script fixes the foreign key constraint error in the webhook
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- CREATE MISSING TRIGGER FUNCTION
-- =============================================================================

-- Create the missing trigger function that should create user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, created_at, updated_at, is_deleted)
  VALUES (NEW.id, NEW.email, NOW(), NOW(), FALSE);
  
  -- Insert into user_preferences table
  INSERT INTO public.user_preferences (user_id, has_completed_onboarding)
  VALUES (NEW.id, FALSE);
  
  -- Insert into user_trials table
  INSERT INTO public.user_trials (user_id, trial_start_time, trial_end_time)
  VALUES (NEW.id, NOW(), NOW() + INTERVAL '48 hours');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- =============================================================================
-- CREATE MISSING USER RECORDS FOR EXISTING USERS
-- =============================================================================

-- Create user records for existing auth users who don't have records in users table
INSERT INTO public.users (id, email, created_at, updated_at, is_deleted)
SELECT 
  au.id,
  au.email,
  COALESCE(au.created_at, NOW()),
  NOW(),
  FALSE
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Create user_preferences for users who don't have them
INSERT INTO public.user_preferences (user_id, has_completed_onboarding)
SELECT 
  au.id,
  FALSE
FROM auth.users au
LEFT JOIN public.user_preferences up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- Create user_trials for users who don't have them
INSERT INTO public.user_trials (user_id, trial_start_time, trial_end_time)
SELECT 
  au.id,
  NOW(),
  NOW() + INTERVAL '48 hours'
FROM auth.users au
LEFT JOIN public.user_trials ut ON au.id = ut.user_id
WHERE ut.user_id IS NULL;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check how many users were created
SELECT 
  'Users created:' as info,
  COUNT(*) as count
FROM public.users;

-- Check for any remaining missing records
SELECT 
  'Auth users without user records:' as info,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

SELECT 
  'Auth users without preferences:' as info,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.user_preferences up ON au.id = up.user_id
WHERE up.user_id IS NULL;

SELECT 
  'Auth users without trials:' as info,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.user_trials ut ON au.id = ut.user_id
WHERE ut.user_id IS NULL;

-- =============================================================================
-- STATUS MESSAGE
-- =============================================================================

SELECT 'Webhook fix completed successfully!' as status; 