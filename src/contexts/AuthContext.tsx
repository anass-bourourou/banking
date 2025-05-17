
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, User } from '@/services/AuthService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await AuthService.checkAuthStatus();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        if (localStorage.getItem('isAuthenticated') === 'true') {
          localStorage.removeItem('isAuthenticated');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('isAuthenticated');
      AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login({ username, password });
      setUser(loggedInUser);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('lastActivityTimestamp', Date.now().toString());
      toast.success("Connexion réussie", {
        description: `Bienvenue ${loggedInUser.name}`
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Échec de la connexion", {
        description: error instanceof Error ? error.message : "Identifiants incorrects"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    try {
      AuthService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('lastActivityTimestamp');
    }
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    login: handleLogin,
    logout: handleLogout,
    checkAuthStatus,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
