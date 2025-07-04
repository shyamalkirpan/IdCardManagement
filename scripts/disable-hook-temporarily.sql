-- Temporary workaround: Disable the hook to allow login
-- This will allow you to sign in while we fix the hook function

-- Option 1: Create a minimal hook that just returns the event unchanged
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Just return the event with minimal default claims
    RETURN jsonb_set(
        event,
        '{claims}',
        jsonb_build_object(
            'user_role', 'teacher',
            'can_manage_users', false,
            'can_manage_school', false
        )
    );
END;
$$;

-- Test this minimal version
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', '00000000-0000-0000-0000-000000000000',
        'claims', jsonb_build_object()
    )
);