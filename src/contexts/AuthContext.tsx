
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, logout, login as apiLogin } from '@/services/api';
import { BaseService } from '@/services/BaseService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
        if (isAuthenticated()) {
          // For demo purposes, set a mock user after login
          setUser({
            id: '1',
            name: 'Anass Belcaid',
            email: 'anass@example.com',
          });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid auth state
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const token = await apiLogin(username, password);
      localStorage.setItem('auth_token', token);
      
      // For demo purposes, set a mock user after login
      setUser({
        id: '1',
        name: 'Anass Belcaid',
        email: username + '@example.com',
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    setUser(null);
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
