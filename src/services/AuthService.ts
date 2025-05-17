
import { User, LoginCredentials, RegistrationData } from './auth/types';

export type { User, LoginCredentials, RegistrationData } from './auth/types';

// Demo user account
const demoUser: User = {
  id: '1',
  name: 'Client Démo',
  email: 'demo@cih.ma',
  role: 'client',
  createdAt: new Date().toISOString(),
  profileImage: null,
  phone: '+212 5XX-XXXX',
  address: 'Casablanca, Maroc',
  lastLogin: new Date().toISOString()
};

export class AuthService {
  /**
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Check if credentials match demo account
        if (credentials.username === 'demo' && credentials.password === 'demo123') {
          // Store auth token in localStorage
          localStorage.setItem('auth_token', 'demo-token-xyz-123');
          localStorage.setItem('isAuthenticated', 'true');
          resolve(demoUser);
        } else {
          reject(new Error('Identifiants incorrects'));
        }
      }, 800); // Simulate network delay
    });
  }
  
  /**
   * Register new user
   */
  static async register(registrationData: RegistrationData): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        const newUser = {
          ...demoUser,
          name: registrationData.name,
          email: registrationData.email
        };
        resolve(newUser);
      }, 800); // Simulate network delay
    });
  }
  
  /**
   * Logout current user
   */
  static logout(): void {
    // Clear auth token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivityTimestamp');
    
    // Force redirect to login page
    window.location.href = '/login';
  }
  
  /**
   * Get current user profile information
   */
  static async getUserProfile(): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          resolve(demoUser);
        } else {
          reject(new Error('Non autorisé'));
        }
      }, 500);
    });
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
      return await this.getUserProfile();
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      return null;
    }
  }
}
