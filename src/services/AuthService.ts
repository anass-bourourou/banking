
import { useSupabase } from './auth/authUtils';
import {
  supabaseLogin,
  supabaseLogout,
  supabaseCheckAuthStatus,
  supabaseUpdateProfile,
  supabaseRegister,
  supabaseResetPassword
} from './auth/supabaseAuth';
import {
  mockLogin,
  mockLogout,
  mockCheckAuthStatus,
  mockUpdateProfile,
  mockRegister,
  mockResetPassword
} from './auth/mockAuth';

// Export types
export type { User, LoginCredentials } from './auth/types';

export class AuthService {
  static async login(credentials: LoginCredentials) {
    if (useSupabase()) {
      return supabaseLogin(credentials);
    } else {
      return mockLogin(credentials);
    }
  }

  static async logout() {
    if (useSupabase()) {
      return supabaseLogout();
    } else {
      return mockLogout();
    }
  }

  static async checkAuthStatus() {
    if (useSupabase()) {
      return supabaseCheckAuthStatus();
    } else {
      return mockCheckAuthStatus();
    }
  }
  
  static async updateProfile(userData) {
    if (useSupabase()) {
      return supabaseUpdateProfile(userData);
    } else {
      return mockUpdateProfile(userData);
    }
  }

  static async register(user) {
    if (useSupabase()) {
      return supabaseRegister(user);
    } else {
      return mockRegister(user);
    }
  }

  static async resetPassword(email) {
    if (useSupabase()) {
      return supabaseResetPassword(email);
    } else {
      return mockResetPassword(email);
    }
  }
}
