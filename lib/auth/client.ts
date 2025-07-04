import { createClient } from '@/lib/supabase/client';
import { jwtDecode } from 'jwt-decode';

// JWT Claims interface for type safety
interface JWTClaims {
  user_role?: string;
  can_manage_users?: boolean;
  can_manage_school?: boolean;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
}
import type { AuthUser, UserProfile, LoginCredentials, SignupData, AuthError } from './types';

export class AuthClient {
  private supabase = createClient();

  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.message } };
      }

      if (data.user && data.session) {
        const user = await this.getUserWithProfile(data.user.id, data.session.access_token);
        return { user, error: null };
      }

      return { user: null, error: { message: 'Authentication failed' } };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  async signUp(signupData: SignupData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            role: signupData.role || 'teacher',
            school_name: signupData.school_name || '',
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.message } };
      }

      if (data.user && data.session) {
        const user = await this.getUserWithProfile(data.user.id, data.session.access_token);
        return { user, error: null };
      }

      return { user: null, error: { message: 'Registration failed' } };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      return await this.getUserWithProfile(session.user.id, session.access_token);
    } catch (error) {
      // Don't log sensitive information in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting current user:', error);
      }
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      // Don't log sensitive information in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting user profile:', error);
      }
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  private async getUserWithProfile(userId: string, accessToken: string): Promise<AuthUser | null> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        return null;
      }

      // Safely decode and validate JWT claims
      let claims: JWTClaims = {};
      try {
        const decoded = jwtDecode<JWTClaims>(accessToken);
        
        // Validate JWT is not expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          throw new Error('Token expired');
        }
        
        // Validate issuer (should be your Supabase URL)
        if (decoded.iss && !decoded.iss.includes('supabase.co')) {
          throw new Error('Invalid token issuer');
        }
        
        claims = decoded;
      } catch (error) {
        // If JWT is invalid, fall back to profile data but log the issue
        console.warn('JWT validation failed, using profile data only');
        claims = {};
      }
      
      // Use profile role as fallback if JWT claims are invalid
      const userRole = claims.user_role || profile.role;
      
      return {
        id: userId,
        email: profile.email,
        profile,
        role: userRole,
        can_manage_users: claims.can_manage_users || false,
        can_manage_school: claims.can_manage_school || false,
      };
    } catch (error) {
      // Don't log sensitive error details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error building user with profile:', error);
      }
      return null;
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getUserWithProfile(session.user.id, session.access_token);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authClient = new AuthClient();