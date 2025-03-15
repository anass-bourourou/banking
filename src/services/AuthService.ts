
// This is a mock service that simulates authentication API calls
// In a real application, this would connect to a backend API

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
  static async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
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

  static async logout(): Promise<void> {
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

  static async checkAuthStatus(): Promise<User | null> {
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
  
  static async updateProfile(userData: Partial<User>): Promise<User> {
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
