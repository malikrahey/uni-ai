-- Complete Database Schema for Acceluni Educational Platform
-- This file contains ALL required tables with proper relationships
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE USER TABLES
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_deleted boolean NULL DEFAULT false,
  deleted_at timestamp with time zone NULL,
  reactivated_at timestamp with time zone NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- User preferences for onboarding and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  has_completed_onboarding boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- User trials for free trial management
CREATE TABLE IF NOT EXISTS public.user_trials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  trial_start_time timestamp with time zone NULL DEFAULT now(),
  trial_end_time timestamp with time zone NOT NULL,
  is_trial_used boolean NULL DEFAULT false,
  CONSTRAINT user_trials_pkey PRIMARY KEY (id),
  CONSTRAINT user_trials_user_id_key UNIQUE (user_id),
  CONSTRAINT user_trials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Subscriptions for payment management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  stripe_customer_id text NULL,
  stripe_subscription_id text NULL,
  status text NULL,
  price_id text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  cancel_at_period_end boolean NULL DEFAULT false,
  updated_at timestamp with time zone NULL DEFAULT now(),
  current_period_end timestamp with time zone NULL,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =============================================================================
-- EDUCATIONAL CONTENT TABLES
-- =============================================================================

-- Degrees table for structured degree programs
CREATE TABLE IF NOT EXISTS public.degrees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT degrees_pkey PRIMARY KEY (id),
  CONSTRAINT degrees_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Courses table (unified schema - supports both standalone and degree-contained courses)
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  degree_id uuid NULL,
  is_standalone boolean NOT NULL DEFAULT true,
  course_order integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id) ON DELETE CASCADE,
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Lessons table for individual lessons within courses
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  content text NOT NULL,
  course_id uuid NOT NULL,
  lesson_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Tests table (one test per lesson)
CREATE TABLE IF NOT EXISTS public.tests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lesson_id uuid NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_lesson_id_key UNIQUE (lesson_id),
  CONSTRAINT tests_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE
);

-- User lesson progress tracking
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  test_score integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_lesson_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_lesson_progress_user_lesson_key UNIQUE (user_id, lesson_id),
  CONSTRAINT user_lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core user indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON public.user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

-- Educational content indexes
CREATE INDEX IF NOT EXISTS idx_degrees_user_id ON public.degrees(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_degree_id ON public.courses(degree_id);
CREATE INDEX IF NOT EXISTS idx_courses_standalone ON public.courses(is_standalone);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_tests_lesson_id ON public.tests(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CLEAN UP EXISTING POLICIES (to avoid conflicts)
-- =============================================================================

-- Drop existing policies if they exist (this prevents the duplicate policy error)
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;

DROP POLICY IF EXISTS "Users can read their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Service role full access to preferences" ON public.user_preferences;

DROP POLICY IF EXISTS "Users can read their own trials" ON public.user_trials;
DROP POLICY IF EXISTS "Users can update their own trials" ON public.user_trials;
DROP POLICY IF EXISTS "Users can insert their own trials" ON public.user_trials;
DROP POLICY IF EXISTS "Service role full access to trials" ON public.user_trials;

DROP POLICY IF EXISTS "Users can read their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role full access to subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can read their own degrees" ON public.degrees;
DROP POLICY IF EXISTS "Users can create their own degrees" ON public.degrees;
DROP POLICY IF EXISTS "Users can update their own degrees" ON public.degrees;
DROP POLICY IF EXISTS "Users can delete their own degrees" ON public.degrees;
DROP POLICY IF EXISTS "Service role full access to degrees" ON public.degrees;

DROP POLICY IF EXISTS "Users can read their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can create their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.courses;
DROP POLICY IF EXISTS "Service role full access to courses" ON public.courses;

DROP POLICY IF EXISTS "Users can read lessons from their courses" ON public.lessons;
DROP POLICY IF EXISTS "Users can create lessons in their courses" ON public.lessons;
DROP POLICY IF EXISTS "Users can update lessons in their courses" ON public.lessons;
DROP POLICY IF EXISTS "Users can delete lessons from their courses" ON public.lessons;
DROP POLICY IF EXISTS "Service role full access to lessons" ON public.lessons;

DROP POLICY IF EXISTS "Users can read tests from their lessons" ON public.tests;
DROP POLICY IF EXISTS "Users can create tests for their lessons" ON public.tests;
DROP POLICY IF EXISTS "Users can update tests for their lessons" ON public.tests;
DROP POLICY IF EXISTS "Users can delete tests from their lessons" ON public.tests;
DROP POLICY IF EXISTS "Service role full access to tests" ON public.tests;

DROP POLICY IF EXISTS "Users can read their own progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Service role full access to progress" ON public.user_lesson_progress;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access to users" ON public.users
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- USER PREFERENCES POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to preferences" ON public.user_preferences
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- USER TRIALS POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own trials" ON public.user_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own trials" ON public.user_trials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trials" ON public.user_trials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to trials" ON public.user_trials
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- SUBSCRIPTIONS POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- DEGREES POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own degrees" ON public.degrees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own degrees" ON public.degrees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own degrees" ON public.degrees
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own degrees" ON public.degrees
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to degrees" ON public.degrees
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- COURSES POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own courses" ON public.courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON public.courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON public.courses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to courses" ON public.courses
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- LESSONS POLICIES
-- =============================================================================

CREATE POLICY "Users can read lessons from their courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lessons in their courses" ON public.lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lessons in their courses" ON public.lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lessons from their courses" ON public.lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to lessons" ON public.lessons
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- TESTS POLICIES
-- =============================================================================

CREATE POLICY "Users can read tests from their lessons" ON public.tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      JOIN public.courses ON courses.id = lessons.course_id
      WHERE lessons.id = tests.lesson_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tests for their lessons" ON public.tests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons 
      JOIN public.courses ON courses.id = lessons.course_id
      WHERE lessons.id = tests.lesson_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tests for their lessons" ON public.tests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      JOIN public.courses ON courses.id = lessons.course_id
      WHERE lessons.id = tests.lesson_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tests from their lessons" ON public.tests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      JOIN public.courses ON courses.id = lessons.course_id
      WHERE lessons.id = tests.lesson_id 
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to tests" ON public.tests
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- USER LESSON PROGRESS POLICIES
-- =============================================================================

CREATE POLICY "Users can read their own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.user_lesson_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to progress" ON public.user_lesson_progress
  FOR ALL TO service_role USING (true);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    -- Check and create trigger for users table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON public.users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for user_preferences table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at 
            BEFORE UPDATE ON public.user_preferences 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for subscriptions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at 
            BEFORE UPDATE ON public.subscriptions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for degrees table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_degrees_updated_at') THEN
        CREATE TRIGGER update_degrees_updated_at 
            BEFORE UPDATE ON public.degrees 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for courses table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
        CREATE TRIGGER update_courses_updated_at 
            BEFORE UPDATE ON public.courses 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for lessons table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lessons_updated_at') THEN
        CREATE TRIGGER update_lessons_updated_at 
            BEFORE UPDATE ON public.lessons 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for tests table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tests_updated_at') THEN
        CREATE TRIGGER update_tests_updated_at 
            BEFORE UPDATE ON public.tests 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Check and create trigger for user_lesson_progress table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_lesson_progress_updated_at') THEN
        CREATE TRIGGER update_user_lesson_progress_updated_at 
            BEFORE UPDATE ON public.user_lesson_progress 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify all tables are created
SELECT 'Schema setup complete. Verifying tables...' as status;

SELECT table_name, 
       CASE WHEN table_name IN (
         'users', 'user_preferences', 'user_trials', 'subscriptions',
         'degrees', 'courses', 'lessons', 'tests', 'user_lesson_progress'
       ) THEN '✓ Required'
       ELSE '? Unknown'
       END as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 'user_preferences', 'user_trials', 'subscriptions',
  'degrees', 'courses', 'lessons', 'tests', 'user_lesson_progress'
)
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, 
       CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS Disabled' END as security_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'users', 'user_preferences', 'user_trials', 'subscriptions',
  'degrees', 'courses', 'lessons', 'tests', 'user_lesson_progress'
)
ORDER BY tablename;

SELECT 'Database schema setup completed successfully!' as final_status; 