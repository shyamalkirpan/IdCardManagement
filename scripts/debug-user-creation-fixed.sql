-- Debug script to identify user creation issues (Fixed version)
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

-- 3. Check if the trigger function exists and get its definition
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

-- 7. Test the trigger function manually (safe test)
SELECT 'Testing trigger function...' as test_status;

-- 8. Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 9. Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles';

-- 10. Try a simple insert test to identify the exact issue
-- This will help us see what constraint is failing
BEGIN;
-- Generate a test UUID
WITH test_data AS (
    SELECT gen_random_uuid() as test_id, 'debug-test@example.com' as test_email
)
INSERT INTO user_profiles (id, email, full_name, role)
SELECT test_id, test_email, 'Debug Test User', 'teacher'::user_role
FROM test_data;
ROLLBACK; -- This rolls back the test insert

-- 11. Check if there are any foreign key constraint issues
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'user_profiles' AND tc.constraint_type = 'FOREIGN KEY';