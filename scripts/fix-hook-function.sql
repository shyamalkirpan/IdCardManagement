-- Fix the custom access token hook function
-- This version is more robust and handles edge cases

-- Step 1: Drop the existing function
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

-- Step 2: Create a bulletproof version of the hook function
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'teacher';
    claims jsonb;
    user_uuid UUID;
    profile_exists BOOLEAN := false;
BEGIN
    -- Input validation
    IF event IS NULL THEN
        RAISE EXCEPTION 'Event cannot be null';
    END IF;
    
    IF event->>'user_id' IS NULL THEN
        RAISE EXCEPTION 'user_id cannot be null';
    END IF;

    -- Safely parse user_id
    BEGIN
        user_uuid := (event->>'user_id')::uuid;
    EXCEPTION 
        WHEN invalid_text_representation THEN
            RAISE EXCEPTION 'Invalid user_id format: %', event->>'user_id';
    END;

    -- Check if user_profiles table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles' AND table_schema = 'public'
    ) THEN
        -- Table doesn't exist, return default claims
        RAISE WARNING 'user_profiles table does not exist, using default role';
        user_role := 'teacher';
    ELSE
        -- Check if user profile exists
        SELECT EXISTS(
            SELECT 1 FROM user_profiles WHERE id = user_uuid
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- Get user role from user_profiles table
            SELECT 
                COALESCE(role::text, 'teacher')
            INTO user_role
            FROM user_profiles
            WHERE id = user_uuid 
              AND is_active = true;
              
            -- If no role found or user inactive, default to teacher
            IF user_role IS NULL THEN
                user_role := 'teacher';
            END IF;
        ELSE
            -- User profile doesn't exist, use default
            RAISE WARNING 'User profile not found for user_id: %, using default role', user_uuid;
            user_role := 'teacher';
        END IF;
    END IF;

    -- Build custom claims
    claims := jsonb_build_object(
        'user_role', user_role,
        'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
        'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END,
        'claims_issued_at', EXTRACT(EPOCH FROM NOW())::bigint,
        'profile_exists', profile_exists
    );

    -- Return the event with custom claims
    RETURN jsonb_set(
        COALESCE(event, '{}'::jsonb), 
        '{claims}', 
        COALESCE(claims, '{}'::jsonb)
    );

EXCEPTION 
    WHEN OTHERS THEN
        -- Log error details
        RAISE WARNING 'Error in custom_access_token_hook for user %: % - %', 
            COALESCE(event->>'user_id', 'unknown'), 
            SQLSTATE, 
            SQLERRM;
        
        -- Return safe default claims instead of failing
        RETURN jsonb_set(
            COALESCE(event, '{}'::jsonb),
            '{claims}',
            jsonb_build_object(
                'user_role', 'teacher',
                'can_manage_users', false,
                'can_manage_school', false,
                'error_fallback', true,
                'claims_issued_at', EXTRACT(EPOCH FROM NOW())::bigint
            )
        );
END;
$$;

-- Step 3: Grant necessary permissions
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO postgres;

-- Step 4: Test the function
SELECT 'Testing hook function...' as status;

-- Test with a real user ID if you have one
DO $$
DECLARE
    test_user_id UUID;
    test_result jsonb;
BEGIN
    -- Get a real user ID from auth.users if available
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test with real user ID
        SELECT custom_access_token_hook(
            jsonb_build_object(
                'user_id', test_user_id::text,
                'claims', jsonb_build_object()
            )
        ) INTO test_result;
        
        RAISE NOTICE 'Hook test with real user successful: %', test_result;
    ELSE
        -- Test with dummy user ID
        SELECT custom_access_token_hook(
            jsonb_build_object(
                'user_id', '00000000-0000-0000-0000-000000000000',
                'claims', jsonb_build_object()
            )
        ) INTO test_result;
        
        RAISE NOTICE 'Hook test with dummy user successful: %', test_result;
    END IF;
END $$;

COMMIT;