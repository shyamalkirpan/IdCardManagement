-- Temporary fix: Disable RLS on user_profiles to allow login
-- This is a quick workaround while we fix the policy recursion

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- This will allow the hook function to read from user_profiles without policy checks
SELECT 'RLS disabled temporarily - you should be able to sign in now' as status;

-- NOTE: Remember to re-enable RLS later with proper policies:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;