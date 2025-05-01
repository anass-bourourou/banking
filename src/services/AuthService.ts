
import { User, LoginCredentials, RegistrationData } from './auth/types';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Export types
export type { User, LoginCredentials, RegistrationData };

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
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
      console.error('Login failed:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetchWithAuth('/auth/logout', {
          method: 'POST',
        });
      }
      
      // Clear the token
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear token on error to ensure UI updates
      localStorage.removeItem('auth_token');
    }
  }

  static async checkAuthStatus(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetchWithAuth('/auth/me');

      if (!response.ok) {
        // Token is invalid
        localStorage.removeItem('auth_token');
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }
  
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      toast.success('Profil mis à jour avec succès');
      return data.user;
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Échec de la mise à jour du profil');
      throw error;
    }
  }

  static async register(user: RegistrationData): Promise<User> {
    try {
      const response = await fetchWithAuth('/auth/register', {
        method: 'POST',
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
      console.error('Registration failed:', error);
      throw error;
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      const response = await fetchWithAuth('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }

      toast.success('Email de réinitialisation envoyé', { 
        description: 'Veuillez vérifier votre boîte de réception' 
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Échec de la réinitialisation du mot de passe');
      throw error;
    }
  }
}
