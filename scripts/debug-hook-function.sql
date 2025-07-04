-- Debug the custom access token hook function
-- Run these queries one by one to identify the issue

-- 1. Check if the function exists
SELECT 
    proname as function_name,
    pronargs as num_args,
    prorettype::regtype as return_type,
    proargtypes::regtype[] as argument_types
FROM pg_proc 
WHERE proname = 'custom_access_token_hook';

-- 2. Check the function definition
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'custom_access_token_hook';

-- 3. Check if user_profiles table exists (required by the hook)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Test the function manually with a dummy payload
-- This will help identify the exact error
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', '00000000-0000-0000-0000-000000000000',
        'claims', jsonb_build_object()
    )
);

-- 5. Check function permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'custom_access_token_hook';

-- 6. Check if the function is SECURITY DEFINER (required for hooks)
SELECT 
    proname,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'custom_access_token_hook';