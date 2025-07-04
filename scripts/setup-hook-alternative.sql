-- Alternative method to set up the Custom Access Token Hook
-- Run this if you can't find the Hooks section in the Supabase dashboard

-- 1. First, ensure the hook function exists (should already be created by setup-auth-schema.sql)
-- You can verify by running: SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook';

-- 2. Configure the hook via SQL (if dashboard method doesn't work)
-- Note: This method may vary depending on your Supabase version

-- Check if the hook is properly configured
SELECT 
    id, 
    hook_table_id, 
    hook_name, 
    type,
    function_name,
    enabled
FROM 
    supabase_functions.hooks 
WHERE 
    function_name = 'custom_access_token_hook';

-- If the above query returns no results, the hook needs to be configured via the dashboard

-- 3. Test the hook function manually
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', auth.uid(),
        'claims', jsonb_build_object()
    )
);

-- This should return the original event with added custom claims