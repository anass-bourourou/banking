
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.checkAuthStatus();
        setUser(currentUser);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid auth state
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login({ username, password });
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
    }
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    login: handleLogin,
    logout: handleLogout,
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
