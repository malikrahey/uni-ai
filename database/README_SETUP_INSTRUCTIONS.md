# 🔧 Database Setup Instructions - UniAi Educational Platform

## 🚨 **CRITICAL ISSUES FOUND**

Your application is failing because of **missing database tables** and **schema conflicts**. Here's what I discovered:

### **Issues Identified:**

1. **❌ Missing `subscriptions` table** - Causing the error you reported
2. **❌ Missing essential tables**: `users`, `user_preferences`, `user_trials`, `degrees`, `lessons`, `tests`, `user_lesson_progress`
3. **⚠️ Schema conflicts**: Two different `courses` table definitions
4. **📊 Unused table**: `course_subjects` is defined but never used in the code

## 🔧 **IMMEDIATE FIX REQUIRED**

### **Step 1: Backup Your Current Database (Important!)**

Before making changes, create a backup of any existing data:

```sql
-- Run this in Supabase SQL Editor to see what tables you currently have
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **Step 2: Apply Complete Schema**

**⚡ Run this command in your Supabase SQL Editor:**

Copy and paste the entire contents of `database/complete_schema.sql` into your Supabase Dashboard → SQL Editor and execute it.

This will create ALL required tables with proper relationships.

### **Step 3: Verify Setup**

After running the schema, you should see this output:

```
✓ Required tables created:
- courses
- degrees  
- lessons
- subscriptions (← This fixes your error!)
- tests
- user_lesson_progress
- user_preferences
- user_trials
- users

✓ RLS Enabled on all tables
✓ All policies created
✓ Indexes created for performance
```

## 📋 **Tables Created**

### **Core User Tables**
- `users` - User profiles extending Supabase auth
- `user_preferences` - Onboarding and settings
- `user_trials` - Free trial management
- `subscriptions` - Payment and subscription data (fixes your error!)

### **Educational Content Tables**
- `degrees` - Degree programs
- `courses` - Individual courses (unified schema)
- `lessons` - Lessons within courses
- `tests` - Quizzes/tests for lessons
- `user_lesson_progress` - Progress tracking

## 🔒 **Security Features**

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Proper foreign key relationships
- ✅ User isolation (users can only see their own data)
- ✅ Service role access for API operations

## 🚀 **Performance Features**

- ✅ Indexes on all foreign keys
- ✅ Indexes on frequently queried columns
- ✅ Automatic timestamp updates
- ✅ Optimized query patterns

## ⚠️ **Important Notes**

### **Schema Conflicts Resolved**

The project had conflicting `courses` table definitions:

- ❌ **Old schema** (`database/schema.sql`): Used `title`, `university`, `degree_type`
- ✅ **New schema** (`complete_schema.sql`): Uses `name`, `description`, `degree_id`, `is_standalone`

The new schema is what your codebase actually expects. The old schema has been **deprecated**.

### **Unused Tables**

- `course_subjects` table is **not used** by your application and has been excluded from the new schema

## 🧪 **Testing After Setup**

1. **Test subscription queries** (should fix your original error):
```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId);
```

2. **Test course creation**:
```javascript
const { data, error } = await supabase
  .from('courses')
  .insert({
    name: 'Test Course',
    description: 'Test Description', 
    user_id: userId,
    is_standalone: true
  });
```

## 🔍 **Verification Commands**

Run these in Supabase SQL Editor to verify everything is working:

```sql
-- Check all required tables exist
SELECT table_name, 'Created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 'user_preferences', 'user_trials', 'subscriptions',
  'degrees', 'courses', 'lessons', 'tests', 'user_lesson_progress'
)
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Test auth context (run when logged in)
SELECT auth.uid() as current_user_id;
```

## 🛠️ **Deprecated Files**

These files are **outdated** and should not be used:

- ❌ `database/schema.sql` (conflicts with current codebase)
- ❌ `initial_supabase_table_schema.sql` (incomplete - missing educational tables)
- ❌ `educational_schema.sql` (partial - doesn't include user/subscription tables)

**Use only:** ✅ `database/complete_schema.sql`

## 🎯 **Expected Results**

After applying the complete schema:

1. ✅ Subscription errors will be **fixed**
2. ✅ Course creation will work
3. ✅ All educational features will function
4. ✅ User management will work properly
5. ✅ Trial system will be operational

## 🆘 **Troubleshooting**

### **If you get permission errors:**
```sql
-- Check if you're authenticated
SELECT auth.uid();

-- If NULL, you need to authenticate first
```

### **If tables already exist with different schemas:**
```sql
-- Drop conflicting tables (CAUTION: This deletes data!)
DROP TABLE IF EXISTS public.courses CASCADE;
-- Then re-run the complete schema
```

### **If you need to start fresh:**
```sql
-- NUCLEAR OPTION - Deletes everything (BACKUP FIRST!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run complete_schema.sql
```

---

**🎉 Once complete, your subscription fetch errors will be resolved and all features will work correctly!** 