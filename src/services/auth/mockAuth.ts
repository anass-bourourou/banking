
import type { LoginCredentials, User, RegistrationData } from './types';

export const mockLogin = async (credentials: LoginCredentials): Promise<User> => {
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
};

export const mockLogout = async (): Promise<void> => {
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
};

export const mockCheckAuthStatus = async (): Promise<User | null> => {
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
};

export const mockUpdateProfile = async (userData: Partial<User>): Promise<User> => {
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
};

export const mockRegister = async (user: RegistrationData): Promise<User> => {
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
};

export const mockResetPassword = async (email: string): Promise<void> => {
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
};
