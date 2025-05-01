
import { API_URL } from '@/config/api.config';
import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
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
    console.log(`🌐 API Request: ${url}`, options.method || 'GET');
    
    if (options.body) {
      console.log('Request payload:', options.body);
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log(`📢 API Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok && !endpoint.includes('/download')) {
      // For non-download endpoints, try to parse error
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP Error: ${response.status} ${response.statusText}` 
      }));
      
      console.error(`❌ API Error (${response.status}):`, errorData);
      
      if (response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('auth_token');
        toast.error('Session expirée', { 
          description: 'Veuillez vous reconnecter' 
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
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
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
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
  address?: string;
  cin?: string;
}): Promise<{ token: string; userId: string }> => {
  try {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de l\'inscription');
    }

    const data = await response.json();
    
    // We won't automatically store the token to maintain proper authentication flow
    // User should explicitly log in after registration
    
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
