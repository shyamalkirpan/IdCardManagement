-- Manual user creation workflow
-- Use this if automatic trigger continues to fail

-- Step 1: Temporarily disable the trigger to isolate the issue
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Step 2: Now try creating a user through the Supabase dashboard
-- Go to Authentication > Users > Add User
-- Email: test@example.com
-- Password: testpassword123
-- Check "Auto Confirm User"

-- Step 3: After user is created, get their ID and manually create profile
-- First, find the user ID:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@example.com';

-- Step 4: Manually insert the user profile
-- Replace 'USER_ID_FROM_STEP_3' with the actual UUID
INSERT INTO user_profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    'USER_ID_FROM_STEP_3'::uuid,  -- Replace with actual user ID
    'test@example.com',
    'Test User',
    'teacher'::user_role,
    NOW(),
    NOW()
);

-- Step 5: Verify the profile was created
SELECT 
    u.email,
    u.created_at as user_created,
    p.full_name,
    p.role,
    p.created_at as profile_created
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'test@example.com';

-- Step 6: Re-enable the trigger for future users
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Step 7: Test the trigger with a new user
-- Go create another user in the dashboard to test if trigger works now