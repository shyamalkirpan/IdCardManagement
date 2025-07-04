# Authentication Setup Guide

## 1. Database Schema for Authentication

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'school', 'teacher');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    school_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'teacher');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

## 2. Row Level Security (RLS) Setup

```sql
-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Admin can read all profiles
CREATE POLICY "Admin can read all profiles" ON user_profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles" ON user_profiles
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Update students table RLS for role-based access
DROP POLICY IF EXISTS "Allow public read access" ON students;
DROP POLICY IF EXISTS "Allow public insert access" ON students;
DROP POLICY IF EXISTS "Allow public update access" ON students;
DROP POLICY IF EXISTS "Allow public delete access" ON students;

-- Add user_id column to students table to track ownership
ALTER TABLE students ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create new RLS policies for students table
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
```

## 3. Custom Claims Function

```sql
-- Function to get user role for JWT claims
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
```

## 4. Auth Hook Setup

In your Supabase dashboard:

1. Go to Database > Functions
2. Create a new function called `custom_access_token_hook`
3. Use the following code:

```sql
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT;
    claims jsonb;
BEGIN
    -- Get user role from user_profiles table
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = (event->>'user_id')::uuid AND is_active = true;

    -- Set default role if not found
    IF user_role IS NULL THEN
        user_role := 'teacher';
    END IF;

    -- Add custom claims
    claims := jsonb_build_object(
        'user_role', user_role,
        'can_manage_users', CASE WHEN user_role = 'admin' THEN true ELSE false END,
        'can_manage_school', CASE WHEN user_role IN ('admin', 'school') THEN true ELSE false END
    );

    -- Return the claims
    RETURN jsonb_set(event, '{claims}', claims);
END;
$$;
```

## 5. Supabase Dashboard Configuration

1. Go to Authentication > Settings
2. Disable "Enable email confirmations" if you want immediate access
3. Set "Site URL" to your domain
4. Under "Auth Hooks", add the custom access token hook

## 6. Initial Admin User Setup

After setting up the schema, create an admin user:

```sql
-- First, create the user through Supabase Auth (do this via the dashboard or API)
-- Then update their role to admin:
UPDATE user_profiles 
SET role = 'admin', full_name = 'System Administrator'
WHERE email = 'admin@example.com';
```

## 7. Testing the Setup

You can test the authentication setup by:

1. Creating a test user through the Supabase dashboard
2. Verifying the user_profiles table is populated
3. Testing JWT claims contain the correct role information
4. Verifying RLS policies work correctly

## 8. Environment Variables

No additional environment variables are needed - the existing Supabase configuration is sufficient.