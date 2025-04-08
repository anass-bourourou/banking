
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { data, error } = await NotificationService.getSupabase()!
          .from('notifications')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Utiliser l'API backend
        const response = await fetchWithAuth('/notifications');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as Notification[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Impossible de récupérer les notifications');
      throw new Error('Impossible de récupérer les notifications');
    }
  }

  static async addNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string;
  }): Promise<Notification> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { data: { user }, error: userError } = await NotificationService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const notificationData = {
          ...notification,
          read: false,
          createdAt: new Date().toISOString(),
          user_id: user.id
        };

        const { data, error } = await NotificationService.getSupabase()!
          .from('notifications')
          .insert(notificationData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de la création de la notification');

        return data;
      } else {
        // Utiliser l'API backend
        const response = await fetchWithAuth('/notifications', {
          method: 'POST',
          body: JSON.stringify(notification)
        });
        const data = await response.json();
        
        if (data && data.id) {
          return data as Notification;
        }
        
        throw new Error('Erreur lors de la création de la notification');
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);

        if (error) throw error;
      } else {
        // Utiliser l'API backend
        await fetchWithAuth(`/notifications/${notificationId}/mark-read`, {
          method: 'PATCH'
        });
      }
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { data: { user }, error: userError } = await NotificationService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) throw error;
      } else {
        // Utiliser l'API backend
        await fetchWithAuth('/notifications/mark-all-read', {
          method: 'PATCH'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;
      } else {
        // Utiliser l'API backend
        await fetchWithAuth(`/notifications/${notificationId}`, {
          method: 'DELETE'
        });
      }
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }
}
