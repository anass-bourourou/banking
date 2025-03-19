
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User, LoginCredentials } from '@/services/AuthService';
import { toast } from 'sonner';

// Ajouter les informations personnelles supplémentaires à la définition du type User
type ExtendedUser = User & {
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  address?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: ExtendedUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<ExtendedUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on load
    const checkAuth = async () => {
      try {
        const userData = await AuthService.checkAuthStatus();
        if (userData) {
          // Ajouter les informations personnelles par défaut pour la démo
          const extendedUser: ExtendedUser = {
            ...userData,
            name: 'Anass Bourourou',
            phone: '0607810824',
            email: 'anassbr01@gmail.com',
            city: 'Casablanca',
            country: 'Maroc',
            address: 'Bouskoura'
          };
          
          setIsAuthenticated(true);
          setUser(extendedUser);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await AuthService.login(credentials);
      
      // Ajouter les informations personnelles par défaut pour la démo
      const extendedUser: ExtendedUser = {
        ...userData,
        name: 'Anass Bourourou',
        phone: '0607810824',
        email: 'anassbr01@gmail.com',
        city: 'Casablanca',
        country: 'Maroc',
        address: 'Bouskoura'
      };
      
      setIsAuthenticated(true);
      setUser(extendedUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<ExtendedUser>): Promise<void> => {
    try {
      // Mise à jour côté API
      const updatedUser = await AuthService.updateProfile(userData);
      
      // Combiner les nouvelles données avec les anciennes
      const extendedUpdatedUser: ExtendedUser = {
        ...updatedUser,
        name: userData.name || user?.name || 'Anass Bourourou',
        phone: userData.phone || user?.phone || '0607810824',
        email: userData.email || user?.email || 'anassbr01@gmail.com',
        city: userData.city || user?.city || 'Casablanca',
        country: userData.country || user?.country || 'Maroc',
        address: userData.address || user?.address || 'Bouskoura'
      };
      
      setUser(extendedUpdatedUser);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Échec de la mise à jour du profil');
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        isLoading, 
        login, 
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
