
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  date: string;
  read: boolean;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const supabase = NotificationService.getSupabase()!;
        
        // Récupérer l'utilisateur actuel
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        
        if (!userId) {
          console.error('Utilisateur non authentifié');
          return [];
        }
        
        // Récupérer les notifications de l'utilisateur
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Erreur lors de la récupération des notifications:', error);
          throw error;
        }
        
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/notifications');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0 && 'title' in data[0]) {
          return data as Notification[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Ne pas bloquer l'interface en cas d'erreur
      return [];
    }
  }
  
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const supabase = NotificationService.getSupabase()!;
        
        // Mettre à jour la notification
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);

        if (error) {
          console.error('Erreur lors du marquage de la notification comme lue:', error);
          throw error;
        }
      } else {
        // Use mock API
        await fetchWithAuth(`/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Ne pas bloquer l'interface en cas d'erreur
    }
  }
  
  static async addNotification(notification: { 
    title: string; 
    message: string; 
    type: 'info' | 'warning' | 'alert';
  }): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const supabase = NotificationService.getSupabase()!;
        
        // Récupérer l'utilisateur actuel
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        
        if (!userId) {
          console.error('Utilisateur non authentifié');
          return;
        }
        
        // Ajouter la notification
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            date: new Date().toISOString(),
            read: false
          });

        if (error) {
          console.error('Erreur lors de l\'ajout de la notification:', error);
          throw error;
        }
      } else {
        // Use mock API
        await fetchWithAuth('/notifications', {
          method: 'POST',
          body: JSON.stringify({
            ...notification,
            date: new Date().toISOString(),
            read: false
          })
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      // Ne pas bloquer le flux principal en cas d'erreur
      console.log('Failed to add notification but continuing flow');
    }
  }
}
