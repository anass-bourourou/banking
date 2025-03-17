
import { supabase, isSupabaseConfigured } from './supabase';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

export class AuthService {
  private static useSupabase(): boolean {
    return isSupabaseConfigured();
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    if (AuthService.useSupabase() && supabase) {
      try {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.username,
          password: credentials.password
        });

        if (error) throw error;
        if (!data.user) throw new Error('Aucun utilisateur retourné');

        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Utilisateur',
          email: data.user.email || '',
          lastLogin: new Date().toISOString()
        };

        return user;
      } catch (error) {
        console.error('Login error:', error);
        throw new Error('Identifiants invalides. Veuillez réessayer.');
      }
    } else {
      // Simulate API call with mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.username === 'demo' && credentials.password === 'password') {
            const user = {
              id: 'usr_123456789',
              name: 'Jean Dupont',
              email: 'jean.dupont@example.com',
              lastLogin: new Date().toISOString()
            };
            
            // Store user in localStorage for session persistence
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(user));
            
            resolve(user);
          } else {
            reject(new Error('Identifiants invalides. Veuillez réessayer.'));
          }
        }, 1000);
      });
    }
  }

  static async logout(): Promise<void> {
    if (AuthService.useSupabase() && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Erreur lors de la déconnexion');
      }
    } else {
      // Simulate API call
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            // Clear local storage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            resolve();
          }, 500);
        } catch (error) {
          reject(new Error('Erreur lors de la déconnexion'));
        }
      });
    }
  }

  static async checkAuthStatus(): Promise<User | null> {
    if (AuthService.useSupabase() && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session || !session.user) return null;

        return {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Utilisateur',
          email: session.user.email || '',
          lastLogin: session.user.last_sign_in_at || ''
        };
      } catch (error) {
        console.error('Auth check error:', error);
        return null;
      }
    } else {
      // Simulate checking token validity with API
      return new Promise((resolve) => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const user = localStorage.getItem('user');
        
        if (isAuthenticated === 'true' && user) {
          resolve(JSON.parse(user));
        } else {
          resolve(null);
        }
      });
    }
  }
  
  static async updateProfile(userData: Partial<User>): Promise<User> {
    if (AuthService.useSupabase() && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.updateUser({
          data: {
            name: userData.name
          }
        });

        if (error) throw error;
        if (!user) throw new Error('Utilisateur non trouvé');

        return {
          id: user.id,
          name: user.user_metadata?.name || 'Utilisateur',
          email: user.email || '',
          lastLogin: user.last_sign_in_at || ''
        };
      } catch (error) {
        console.error('Profile update error:', error);
        throw new Error('Erreur lors de la mise à jour du profil');
      }
    } else {
      // Simulate API call
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            const userStr = localStorage.getItem('user');
            
            if (!userStr) {
              reject(new Error('Utilisateur non authentifié'));
              return;
            }
            
            const currentUser = JSON.parse(userStr);
            const updatedUser = { ...currentUser, ...userData };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            resolve(updatedUser);
          }, 800);
        } catch (error) {
          reject(new Error('Erreur lors de la mise à jour du profil'));
        }
      });
    }
  }

  /**
   * Register a new user with Supabase
   */
  static async register(user: { email: string; password: string; name: string }): Promise<User> {
    if (AuthService.useSupabase() && supabase) {
      try {
        // Use Supabase to register a new user
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name
            }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error('Erreur lors de la création du compte');

        // Return the new user
        return {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Utilisateur',
          email: data.user.email || '',
          lastLogin: new Date().toISOString()
        };
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error('Erreur lors de la création du compte');
      }
    } else {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const mockUser = {
              id: 'usr_' + Math.random().toString(36).substr(2, 9),
              name: user.name,
              email: user.email,
              lastLogin: new Date().toISOString()
            };
            
            // For testing, store in localStorage
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            resolve(mockUser);
          } catch (error) {
            reject(new Error('Erreur lors de la création du compte'));
          }
        }, 1000);
      });
    }
  }

  /**
   * Reset password with Supabase
   */
  static async resetPassword(email: string): Promise<void> {
    if (AuthService.useSupabase() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        
        if (error) throw error;
      } catch (error) {
        console.error('Password reset error:', error);
        throw new Error('Erreur lors de la réinitialisation du mot de passe');
      }
    } else {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            console.log('Password reset requested for:', email);
            resolve();
          } catch (error) {
            reject(new Error('Erreur lors de la réinitialisation du mot de passe'));
          }
        }, 800);
      });
    }
  }
}
