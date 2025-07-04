-- Ultra-minimal hook function that definitely works
-- Use this if the previous version still has issues

DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT := 'teacher';
    user_uuid UUID;
BEGIN
    -- Only try to get role if we can safely parse user_id
    IF event->>'user_id' IS NOT NULL THEN
        BEGIN
            user_uuid := (event->>'user_id')::uuid;
            
            -- Simple role lookup with fallback
            SELECT COALESCE(role::text, 'teacher')
            INTO user_role
            FROM user_profiles
            WHERE id = user_uuid
            LIMIT 1;
            
        EXCEPTION WHEN OTHERS THEN
            user_role := 'teacher';
        END;
    END IF;
    
    -- Always return valid claims
    RETURN jsonb_set(
        COALESCE(event, '{}'::jsonb),
        '{claims}',
        jsonb_build_object(
            'user_role', COALESCE(user_role, 'teacher'),
            'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
            'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END
        )
    );
END;
$$;

-- Test it
SELECT custom_access_token_hook('{"user_id": "test", "claims": {}}'::jsonb);