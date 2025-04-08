
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  date: string; // Explicitly define this field
  category?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { data, error } = await NotificationService.getSupabase()!
          .from('notifications')
          .select('*')
          .order('date', { ascending: false });

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

  static async markAsRead(id: string): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .update({ read: true })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Utiliser l'API backend
        await fetchWithAuth(`/notifications/${id}/read`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      toast.error('Impossible de marquer la notification comme lue');
      throw new Error('Impossible de marquer la notification comme lue');
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .update({ read: true })
          .eq('read', false);

        if (error) throw error;
      } else {
        // Utiliser l'API backend
        await fetchWithAuth('/notifications/read-all', {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Impossible de marquer toutes les notifications comme lues');
      throw new Error('Impossible de marquer toutes les notifications comme lues');
    }
  }
}
