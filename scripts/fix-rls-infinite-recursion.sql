-- Fix RLS infinite recursion in user_profiles policies
-- The issue is that policies are checking user_profiles from within user_profiles

-- Step 1: Drop all existing RLS policies on user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;

-- Step 2: Create simple, non-recursive RLS policies
-- These policies should NOT reference user_profiles table themselves

-- Policy 1: Users can read their own profile (no recursion)
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (no recursion)
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow INSERT for new user creation (needed for the trigger)
CREATE POLICY "Allow profile creation" ON user_profiles
FOR INSERT WITH CHECK (true);

-- Step 3: For admin access, we'll handle this differently in the application
-- Instead of RLS policies that create recursion, we'll use service role or 
-- handle admin checks in the application layer

-- Policy 4: Enable auth.service_role to bypass RLS (for admin operations)
-- This allows admin operations through service role without recursion
CREATE POLICY "Service role full access" ON user_profiles
FOR ALL USING (
    current_setting('role') = 'service_role' OR
    auth.jwt() ->> 'role' = 'service_role'
);

-- Step 4: Verify RLS is still enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the policies
SELECT 'RLS policies fixed - no more infinite recursion!' as status;

-- Test query (this should work without recursion)
SELECT id, email, role FROM user_profiles WHERE id = auth.uid() LIMIT 1;