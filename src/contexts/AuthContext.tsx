
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, logout } from '@/services/api';
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
  login: (token: string, userData: Partial<User>) => void;
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
          // If Supabase is available, get user from Supabase
          if (BaseService.useSupabase() && BaseService.getSupabase()) {
            const { data, error } = await BaseService.getSupabase()!.auth.getUser();
            
            if (error) {
              throw error;
            }
            
            if (data.user) {
              // Get user profile
              const { data: profile } = await BaseService.getSupabase()!
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
              setUser({
                id: data.user.id,
                email: data.user.email || '',
                name: profile?.name || data.user.email?.split('@')[0] || 'User',
                avatar: profile?.avatar_url,
              });
            }
          } else {
            // Mock authenticated user
            setUser({
              id: '1',
              name: 'Anass Belcaid',
              email: 'anass@example.com',
            });
          }
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
  
  const handleLogin = (token: string, userData: Partial<User>) => {
    localStorage.setItem('auth_token', token);
    
    setUser({
      id: userData.id || '1',
      name: userData.name || 'User',
      email: userData.email || 'user@example.com',
      avatar: userData.avatar,
    });
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
