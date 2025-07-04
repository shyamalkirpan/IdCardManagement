-- =====================================================
-- Student ID Management System - Authentication Setup
-- =====================================================
-- Run this script in your Supabase SQL Editor to set up authentication

-- 1. Create user roles enum
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'school', 'teacher');

-- 2. Create user profiles table
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    school_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 5. Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'teacher')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 7. Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;

-- 9. Create RLS policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admin can read all profiles" ON user_profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admin can update all profiles" ON user_profiles
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 10. Update students table for role-based access
-- Add user_id column to students table to track ownership
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 11. Drop existing RLS policies on students table
DROP POLICY IF EXISTS "Allow public read access" ON students;
DROP POLICY IF EXISTS "Allow public insert access" ON students;
DROP POLICY IF EXISTS "Allow public update access" ON students;
DROP POLICY IF EXISTS "Allow public delete access" ON students;

-- 12. Create new RLS policies for students table
CREATE POLICY "Users can read own students" ON students
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'school')
    )
);

CREATE POLICY "Users can insert own students" ON students
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students" ON students
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'school')
    )
);

CREATE POLICY "Users can delete own students" ON students
FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 13. Function to get user role for JWT claims
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = user_id AND is_active = true;
    
    RETURN COALESCE(user_role, 'teacher');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;

-- 14. Custom Access Token Hook Function
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    claims jsonb;
    user_uuid UUID;
BEGIN
    -- Validate input
    IF event IS NULL OR event->>'user_id' IS NULL THEN
        RAISE EXCEPTION 'Invalid event data';
    END IF;

    -- Safely cast user_id
    BEGIN
        user_uuid := (event->>'user_id')::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid user_id format';
    END;

    -- Get user role from user_profiles table with additional security checks
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = user_uuid 
      AND is_active = true
      AND created_at > NOW() - INTERVAL '2 years'; -- Prevent very old accounts

    -- Set default role if not found
    IF user_role IS NULL THEN
        user_role := 'teacher';
    END IF;

    -- Add custom claims with timestamp for verification
    claims := jsonb_build_object(
        'user_role', user_role,
        'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
        'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END,
        'claims_issued_at', EXTRACT(EPOCH FROM NOW())::bigint
    );

    -- Return the event with custom claims
    RETURN jsonb_set(event, '{claims}', claims);
EXCEPTION WHEN OTHERS THEN
    -- Log error and return default claims
    INSERT INTO auth.audit_log_entries (instance_id, id, payload, created_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        gen_random_uuid(),
        jsonb_build_object(
            'error', 'custom_access_token_hook_failed',
            'user_id', event->>'user_id',
            'error_message', SQLERRM
        ),
        NOW()
    );
    
    -- Return minimal safe claims
    RETURN jsonb_set(event, '{claims}', jsonb_build_object('user_role', 'teacher'));
END;
$$;

-- =====================================================
-- IMPORTANT: Manual Steps Required
-- =====================================================
-- 
-- 1. Go to your Supabase Dashboard > Authentication > Settings
-- 2. Disable "Enable email confirmations" if you want immediate access
-- 3. Set "Site URL" to your domain (e.g., http://localhost:3000)
-- 4. Under "Hooks", add a new "Custom Access Token" hook:
--    - Hook Name: custom_access_token_hook
--    - SQL Function: custom_access_token_hook
--    - Enabled: Yes
--
-- 5. Create your first admin user:
--    a. Go to Authentication > Users
--    b. Create a new user manually OR
--    c. Run this SQL after creating a user through the UI:
--       UPDATE user_profiles 
--       SET role = 'admin', full_name = 'System Administrator'
--       WHERE email = 'your-admin-email@example.com';
--
-- =====================================================

-- Sample admin user creation (uncomment and modify)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
-- VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), NOW());

COMMIT;