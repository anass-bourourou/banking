
import { API_URL } from '@/config/api.config';
import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Using export type to avoid circular dependency issues
export type { Transaction } from '@/types/transaction';

// Function to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Function to fetch with authentication
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && (!options.body || typeof options.body === 'string')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    console.log(`🌐 API Request: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok && !endpoint.includes('/download')) {
      // For non-download endpoints, try to parse error
      const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status} ${response.statusText}` }));
      
      console.error(`❌ API Error (${response.status}):`, errorData);
      
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    console.log(`✅ API Response: ${url}`, response.status);
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Only show toast for non-download endpoints and non-404 errors (404s are often handled by the UI)
    if (!endpoint.includes('/download') && !(error instanceof Error && error.message.includes('404'))) {
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
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de la connexion');
    }

    const data = await response.json();
    
    // Save token to localStorage
    localStorage.setItem('auth_token', data.token);
    
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
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de l\'inscription');
    }

    const data = await response.json();
    
    // Save token to localStorage
    localStorage.setItem('auth_token', data.token);
    
    return { token: data.token, userId: data.userId };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  // Redirect to login page
  window.location.href = '/login';
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Function to handle API errors
export const handleApiError = (error: unknown, defaultMessage: string = 'Une erreur est survenue'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};
