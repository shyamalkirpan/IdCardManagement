-- Fix the custom access token hook volatility issue
-- The function was marked as STABLE but trying to do INSERT operations

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

-- Create a corrected version without INSERT operations
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE  -- This is fine now because we removed INSERT operations
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'teacher';
    claims jsonb;
    user_uuid UUID;
BEGIN
    -- Input validation
    IF event IS NULL OR event->>'user_id' IS NULL THEN
        -- Return default claims without logging (no INSERT)
        RETURN jsonb_set(
            COALESCE(event, '{}'::jsonb),
            '{claims}',
            jsonb_build_object(
                'user_role', 'teacher',
                'can_manage_users', false,
                'can_manage_school', false,
                'error', 'invalid_input'
            )
        );
    END IF;

    -- Safely parse user_id
    BEGIN
        user_uuid := (event->>'user_id')::uuid;
    EXCEPTION 
        WHEN invalid_text_representation THEN
            -- Return default claims without logging
            RETURN jsonb_set(
                event,
                '{claims}',
                jsonb_build_object(
                    'user_role', 'teacher',
                    'can_manage_users', false,
                    'can_manage_school', false,
                    'error', 'invalid_user_id'
                )
            );
    END;

    -- Try to get user role (no INSERT operations in exception handling)
    BEGIN
        -- Check if user_profiles table exists and get role
        SELECT COALESCE(role::text, 'teacher')
        INTO user_role
        FROM user_profiles
        WHERE id = user_uuid 
          AND is_active = true;
          
        -- If no role found, keep default
        IF user_role IS NULL THEN
            user_role := 'teacher';
        END IF;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- Just use default role, no logging
            user_role := 'teacher';
    END;

    -- Build custom claims
    claims := jsonb_build_object(
        'user_role', user_role,
        'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
        'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END,
        'claims_issued_at', EXTRACT(EPOCH FROM NOW())::bigint
    );

    -- Return the event with custom claims
    RETURN jsonb_set(
        event, 
        '{claims}', 
        claims
    );

END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO postgres;

-- Test the function
SELECT 'Fixed hook function created successfully!' as status;

-- Test with dummy data
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', '00000000-0000-0000-0000-000000000000',
        'claims', jsonb_build_object()
    )
) as test_result;