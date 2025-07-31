# Database Setup for Acceluni Courses System

This directory contains the database schema and setup instructions for the Acceluni courses management system.

## Prerequisites

- Supabase project set up
- Database access (either through Supabase Dashboard SQL Editor or direct PostgreSQL connection)

## Setup Instructions

### 1. Run the Schema

Execute the SQL commands in `schema.sql` to create the necessary tables and policies:

```sql
-- Run this in your Supabase SQL Editor or PostgreSQL client
\i database/schema.sql
```

Or copy and paste the contents of `schema.sql` into the Supabase Dashboard → SQL Editor.

### 2. Verify Tables Created

After running the schema, you should have the following tables:

- `courses` - Main table for degree programs
- `course_subjects` - Individual subjects/courses within each degree

### 3. Test the Setup

You can test the setup by:

1. Creating a user account through your authentication system
2. Using the API endpoints to create a course
3. Verifying data appears in the database

## Database Schema Overview

### `courses` table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `title` (VARCHAR) - e.g., "Computer Science Degree"
- `university` (VARCHAR) - e.g., "MIT"
- `degree_type` (VARCHAR) - e.g., "Computer Science"
- `duration_years` (INTEGER) - Default: 4
- `start_date` (TIMESTAMP)
- `target_graduation_date` (TIMESTAMP)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `is_deleted` (BOOLEAN) - For soft deletes

### `course_subjects` table
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key to courses)
- `subject_name` (VARCHAR) - e.g., "Data Structures"
- `credits` (INTEGER) - Default: 3
- `semester` (INTEGER) - Which semester this subject is in
- `completed` (BOOLEAN) - Whether student completed this subject
- `description` (TEXT)
- `prerequisites` (TEXT[]) - Array of prerequisite subject names
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Security

The schema includes Row Level Security (RLS) policies that ensure:

- Users can only access their own courses
- Users can only access subjects from their own courses
- All operations (SELECT, INSERT, UPDATE, DELETE) are properly secured

## API Integration

The schema is designed to work with the API routes in `/app/api/courses/`:

- `GET /api/courses` - List all user courses
- `POST /api/courses` - Create new course
- `GET /api/courses/[id]` - Get specific course with subjects
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Soft delete course

## Sample Data (Optional)

Uncomment the sample data section in `schema.sql` to add test courses, but make sure to replace `YOUR_USER_ID_HERE` with an actual user ID from your `auth.users` table.

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**: Make sure your Supabase client is properly authenticated
2. **Foreign Key Constraints**: Ensure the user exists in `auth.users` before creating courses
3. **Permission Denied**: Check that RLS policies are enabled and user is authenticated

### Verifying Setup

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_subjects');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'course_subjects');
```

## Future Enhancements

The schema is designed to support future features like:

- AI-generated course curricula
- Prerequisite tracking and validation
- Progress analytics and reporting
- Collaborative study groups
- Assignment and test management 