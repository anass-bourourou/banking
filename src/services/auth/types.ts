
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
}
