
// This is a mock service that simulates authentication API calls
// In a real application, this would connect to a backend API

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'demo' && credentials.password === 'password') {
          resolve({
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  static async logout(): Promise<void> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
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
}
