-- Emergency: Temporarily disable the hook to allow login
-- Use this only if the fixed version still has issues

-- Option 1: Create a pass-through hook that does nothing
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Just return the event unchanged - no custom claims
    RETURN event;
END;
$$;

-- Option 2: If you need to completely remove the hook:
-- Go to Supabase Dashboard > Authentication > Hooks
-- Delete or disable the custom_access_token_hook

SELECT 'Emergency hook disabled - you can now sign in' as status;