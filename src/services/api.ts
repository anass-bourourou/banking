
import { API_URL } from '@/config/api.config';
import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Re-export the Transaction interface from TransactionService
export type { Transaction } from './TransactionService';

// Function to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Function to fetch with authentication
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !options.body || typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok && !endpoint.includes('/download')) {
      // For non-download endpoints, try to parse error
      const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Only show toast for non-download endpoints
    if (!endpoint.includes('/download')) {
      toast.error('Erreur de connexion', { 
        description: error instanceof Error ? error.message : 'Impossible de contacter le serveur'
      });
    }
    
    throw error;
  }
};

// Login function
export const login = async (username: string, password: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; userId: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return { token: data.token, userId: data.userId };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
