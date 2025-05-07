
import { fetchWithAuth } from './api';
import { User, LoginCredentials, RegistrationData } from './auth/types';
import { ENDPOINTS } from '@/config/api.config';
import { useToast } from '@/hooks/use-toast';

export type { User, LoginCredentials, RegistrationData } from './auth/types';

export class AuthService {
  /**
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetchWithAuth(ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants incorrects');
      }
      
      const data = await response.json();
      
      // Store auth token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  
  /**
   * Register new user
   */
  static async register(registrationData: RegistrationData): Promise<User> {
    try {
      const response = await fetchWithAuth(ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'inscription');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Logout current user
   */
  static logout(): void {
    // Clear auth token
    localStorage.removeItem('auth_token');
    
    // Try to hit the logout endpoint if available
    fetchWithAuth(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST'
    }).catch(error => {
      console.error('Error during logout:', error);
    });
    
    // Force redirect to login page
    window.location.href = '/login';
  }
  
  /**
   * Get current user profile information
   */
  static async getUserProfile(): Promise<User> {
    try {
      const response = await fetchWithAuth(ENDPOINTS.AUTH.PROFILE);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossible de récupérer le profil');
      }
      
      const data = await response.json();
      return data as User;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated and get current user
   */
  static async checkAuthStatus(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return null;
    }
    
    try {
      const user = await this.getUserProfile();
      return user;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      return null;
    }
  }
}
