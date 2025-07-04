-- Fix the custom access token hook to preserve the original event structure
-- The hook should only ADD custom claims, not replace the entire event

DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'teacher';
    user_uuid UUID;
    custom_claims jsonb;
    existing_claims jsonb;
BEGIN
    -- Get existing claims from the event (preserve them)
    existing_claims := COALESCE(event->'claims', '{}'::jsonb);
    
    -- Only try to get role if we can safely parse user_id
    IF event->>'user_id' IS NOT NULL THEN
        BEGIN
            user_uuid := (event->>'user_id')::uuid;
            
            -- Simple role lookup with fallback
            SELECT COALESCE(role::text, 'teacher')
            INTO user_role
            FROM user_profiles
            WHERE id = user_uuid AND is_active = true
            LIMIT 1;
            
            -- If no role found, keep default
            IF user_role IS NULL THEN
                user_role := 'teacher';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            user_role := 'teacher';
        END;
    END IF;
    
    -- Create our custom claims
    custom_claims := jsonb_build_object(
        'user_role', user_role,
        'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
        'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END,
        'claims_issued_at', EXTRACT(EPOCH FROM NOW())::bigint
    );
    
    -- Merge existing claims with our custom claims
    custom_claims := existing_claims || custom_claims;
    
    -- Return the ENTIRE original event with only the claims section updated
    RETURN jsonb_set(
        event,  -- Keep the original event structure
        '{claims}', 
        custom_claims  -- Only update the claims
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO postgres;

-- Test the function with a realistic event structure
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', '00000000-0000-0000-0000-000000000000',
        'claims', jsonb_build_object(),
        'aud', 'authenticated',
        'role', 'authenticated',
        'email', 'test@example.com'
    )
) as test_result;

SELECT 'Hook function fixed - should preserve original event structure!' as status;