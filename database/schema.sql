-- Database schema for UniAi courses system
-- This file contains the SQL commands to create the necessary tables for course management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    degree_type VARCHAR(100) NOT NULL,
    duration_years INTEGER DEFAULT 4,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_graduation_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create course_subjects table
CREATE TABLE IF NOT EXISTS course_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    credits INTEGER DEFAULT 3,
    semester INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    description TEXT,
    prerequisites TEXT[], -- Array of prerequisite subject names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_deleted ON courses(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_course_subjects_course_id ON course_subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_course_subjects_semester ON course_subjects(course_id, semester);

-- Create RLS (Row Level Security) policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_subjects ENABLE ROW LEVEL SECURITY;

-- Courses RLS policies
-- Users can only see their own courses
CREATE POLICY "Users can view their own courses" ON courses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own courses
CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own courses
CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own courses
CREATE POLICY "Users can delete their own courses" ON courses
    FOR DELETE USING (auth.uid() = user_id);

-- Course subjects RLS policies
-- Users can only see subjects from their own courses
CREATE POLICY "Users can view their own course subjects" ON course_subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_subjects.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- Users can only insert subjects to their own courses
CREATE POLICY "Users can insert subjects to their own courses" ON course_subjects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_subjects.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- Users can only update subjects from their own courses
CREATE POLICY "Users can update their own course subjects" ON course_subjects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_subjects.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- Users can only delete subjects from their own courses
CREATE POLICY "Users can delete their own course subjects" ON course_subjects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_subjects.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_subjects_updated_at 
    BEFORE UPDATE ON course_subjects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- This will only work if you have users in your auth.users table
/*
INSERT INTO courses (user_id, title, university, degree_type, duration_years, description) VALUES
    ('YOUR_USER_ID_HERE', 'Computer Science Degree', 'MIT', 'Computer Science', 4, 'Bachelor of Science in Computer Science with focus on AI and Machine Learning'),
    ('YOUR_USER_ID_HERE', 'Business Administration', 'Harvard Business School', 'Business Administration', 2, 'Master of Business Administration with concentration in Technology Management');

INSERT INTO course_subjects (course_id, subject_name, credits, semester, completed) VALUES
    -- Computer Science subjects
    ((SELECT id FROM courses WHERE title = 'Computer Science Degree' LIMIT 1), 'Introduction to Computer Science', 3, 1, true),
    ((SELECT id FROM courses WHERE title = 'Computer Science Degree' LIMIT 1), 'Calculus I', 4, 1, true),
    ((SELECT id FROM courses WHERE title = 'Computer Science Degree' LIMIT 1), 'Data Structures and Algorithms', 4, 2, false),
    ((SELECT id FROM courses WHERE title = 'Computer Science Degree' LIMIT 1), 'Object-Oriented Programming', 3, 2, false),
    -- Business subjects
    ((SELECT id FROM courses WHERE title = 'Business Administration' LIMIT 1), 'Financial Accounting', 3, 1, false),
    ((SELECT id FROM courses WHERE title = 'Business Administration' LIMIT 1), 'Marketing Management', 3, 1, false),
    ((SELECT id FROM courses WHERE title = 'Business Administration' LIMIT 1), 'Operations Management', 3, 2, false),
    ((SELECT id FROM courses WHERE title = 'Business Administration' LIMIT 1), 'Strategic Management', 3, 2, false);
*/ 