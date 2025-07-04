-- Debug script to identify user creation issues
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if user_profiles table exists and has correct structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check if user_role enum exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'user_role'
);

-- 3. Check if the trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check recent auth.users entries (if any were created)
SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if any user_profiles were created
SELECT id, email, full_name, role, created_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check for any errors in the logs (if accessible)
-- This might not work depending on your Supabase plan
SELECT *
FROM postgres_logs 
WHERE message LIKE '%user_profiles%' OR message LIKE '%handle_new_user%'
ORDER BY timestamp DESC 
LIMIT 10;