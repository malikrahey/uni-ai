-- Educational platform database schema extension
-- This file extends the existing schema with educational functionality

-- Degrees table
CREATE TABLE public.degrees (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT degrees_pkey PRIMARY KEY (id),
  CONSTRAINT degrees_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Courses table (supports both standalone and degree-contained courses)
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  degree_id uuid,
  is_standalone boolean NOT NULL DEFAULT true,
  course_order integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id) ON DELETE CASCADE,
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Lessons table
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
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
) TABLESPACE pg_default;

-- Tests table (one test per lesson)
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  lesson_id uuid NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_lesson_id_key UNIQUE (lesson_id),
  CONSTRAINT tests_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- User lesson progress tracking
CREATE TABLE public.user_lesson_progress (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
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
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX idx_courses_standalone ON public.courses(is_standalone);
CREATE INDEX idx_courses_degree_id ON public.courses(degree_id);
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, lesson_order);
CREATE INDEX idx_tests_lesson_id ON public.tests(lesson_id);
CREATE INDEX idx_user_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- Enable Row Level Security on all new tables
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Degrees table policies
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

-- Courses table policies
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

-- Lessons table policies (access through course ownership)
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

-- Tests table policies (access through lesson ownership)
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

-- User lesson progress policies
CREATE POLICY "Users can read their own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.user_lesson_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to progress" ON public.user_lesson_progress
  FOR ALL TO service_role USING (true); 