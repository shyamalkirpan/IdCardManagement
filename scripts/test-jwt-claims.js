// Test script to verify JWT claims are working
// Run this in your browser console after logging in

// 1. Check if user is logged in
console.log('Current user:', window.supabase?.auth.user());

// 2. Get the current session
window.supabase?.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log('Session found:', session);
    
    // 3. Decode the JWT token (you'll need jwt-decode library)
    // You can also check at https://jwt.io/
    console.log('Access Token:', session.access_token);
    
    // 4. The token should contain custom claims like:
    // {
    //   "user_role": "admin",
    //   "can_manage_users": true,
    //   "can_manage_school": true,
    //   "claims_issued_at": 1234567890
    // }
  } else {
    console.log('No session found - user not logged in');
  }
});

// Alternative: Check via your auth context
console.log('Auth Context User:', /* your auth context user object */);