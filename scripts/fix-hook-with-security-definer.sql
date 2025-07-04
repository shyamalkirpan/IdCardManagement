-- Better fix: Make the hook function bypass RLS by using SECURITY DEFINER properly
-- This allows the hook to read user_profiles without being subject to RLS policies

DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER  -- This makes the function run with postgres privileges
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
            
            -- Query user_profiles as postgres user (bypasses RLS)
            -- This is safe because this function is only called by Supabase auth system
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

-- Grant permissions to Supabase auth
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO postgres;

-- Now restore the simple RLS policies (without recursion)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation" ON user_profiles
FOR INSERT WITH CHECK (true);

SELECT 'Hook function and RLS policies fixed!' as status;

-- Test the function
SELECT custom_access_token_hook(
    jsonb_build_object(
        'user_id', '00000000-0000-0000-0000-000000000000',
        'claims', jsonb_build_object()
    )
) as test_result;