-- Manual user creation method (if trigger approach fails)
-- This bypasses the automatic trigger and creates users manually

-- Step 1: Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create user manually in auth.users table
-- Note: Replace with your desired email and password
-- The password will be hashed automatically by Supabase

-- Method A: Using Supabase Admin API (Recommended)
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- Use the dashboard interface instead of SQL for user creation

-- Method B: Manual SQL insertion (Advanced - use only if dashboard fails)
-- DO NOT USE THIS unless absolutely necessary
/*
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test User"}',
    false,
    NOW(),
    NOW()
);
*/

-- Step 3: After creating user via dashboard, manually create the profile
-- Replace 'USER_ID_HERE' with the actual UUID from the created user
INSERT INTO user_profiles (id, email, full_name, role)
VALUES (
    'USER_ID_HERE', -- Replace with actual user ID
    'test@example.com',
    'Test User',
    'teacher'
);

-- Step 4: Re-enable the trigger for future users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.email, ''), 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'), 
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'teacher')
    );
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();