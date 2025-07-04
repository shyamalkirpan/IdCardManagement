export type UserRole = 'admin' | 'school' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
  role: UserRole;
  can_manage_users: boolean;
  can_manage_school: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  school_name?: string;
}