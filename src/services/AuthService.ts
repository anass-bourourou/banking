
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
import { User, LoginCredentials, RegistrationData } from './auth/types';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Export types
export type { User, LoginCredentials, RegistrationData };

export class AuthService {
  static async login(credentials: LoginCredentials) {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store the token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        return data.user;
      } catch (error) {
        console.error('Express login failed, falling back to mock:', error);
        // Fall back to mock login if Express login fails
        return mockLogin(credentials);
      }
    } else if (useSupabase()) {
      return supabaseLogin(credentials);
    } else {
      return mockLogin(credentials);
    }
  }

  static async logout() {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
        
        // Clear the token
        localStorage.removeItem('auth_token');
        return { success: true };
      } catch (error) {
        console.error('Express logout failed:', error);
        return { success: true }; // Still return success to ensure the UI updates
      }
    } else if (useSupabase()) {
      return supabaseLogout();
    } else {
      return mockLogout();
    }
  }

  static async checkAuthStatus() {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          return null;
        }
        
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid
          localStorage.removeItem('auth_token');
          return null;
        }

        const data = await response.json();
        return data.user;
      } catch (error) {
        console.error('Express auth check failed, falling back to mock:', error);
        return mockCheckAuthStatus();
      }
    } else if (useSupabase()) {
      return supabaseCheckAuthStatus();
    } else {
      return mockCheckAuthStatus();
    }
  }
  
  static async updateProfile(userData) {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Profile update failed');
        }

        return await response.json();
      } catch (error) {
        console.error('Express profile update failed, falling back to mock:', error);
        return mockUpdateProfile(userData);
      }
    } else if (useSupabase()) {
      return supabaseUpdateProfile(userData);
    } else {
      return mockUpdateProfile(userData);
    }
  }

  static async register(user) {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        
        return data.user;
      } catch (error) {
        console.error('Express registration failed, falling back to mock:', error);
        return mockRegister(user);
      }
    } else if (useSupabase()) {
      return supabaseRegister(user);
    } else {
      return mockRegister(user);
    }
  }

  static async resetPassword(email) {
    // Try to use Express backend if API_URL is set
    if (API_URL && !useSupabase()) {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Password reset failed');
        }

        return { success: true };
      } catch (error) {
        console.error('Express password reset failed, falling back to mock:', error);
        return mockResetPassword(email);
      }
    } else if (useSupabase()) {
      return supabaseResetPassword(email);
    } else {
      return mockResetPassword(email);
    }
  }
}
