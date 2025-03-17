
import { formatSupabaseUser, getSupabaseClient } from './authUtils';
import type { LoginCredentials, User, RegistrationData } from './types';

export const supabaseLogin = async (credentials: LoginCredentials): Promise<User> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.username,
      password: credentials.password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Aucun utilisateur retourné');

    return formatSupabaseUser(data.user);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Identifiants invalides. Veuillez réessayer.');
  }
};

export const supabaseLogout = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Erreur lors de la déconnexion');
  }
};

export const supabaseCheckAuthStatus = async (): Promise<User | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session || !session.user) return null;

    return formatSupabaseUser(session.user);
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};

export const supabaseUpdateProfile = async (userData: Partial<User>): Promise<User> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: {
        name: userData.name
      }
    });

    if (error) throw error;
    if (!user) throw new Error('Utilisateur non trouvé');

    return formatSupabaseUser(user);
  } catch (error) {
    console.error('Profile update error:', error);
    throw new Error('Erreur lors de la mise à jour du profil');
  }
};

export const supabaseRegister = async (user: RegistrationData): Promise<User> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Erreur lors de la création du compte');

    return formatSupabaseUser(data.user);
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Erreur lors de la création du compte');
  }
};

export const supabaseResetPassword = async (email: string): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error('Erreur lors de la réinitialisation du mot de passe');
  }
};
