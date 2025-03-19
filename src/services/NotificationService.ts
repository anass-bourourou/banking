
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
        const { data, error } = await NotificationService.getSupabase()!
          .from('notifications')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
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
      throw new Error('Impossible de récupérer les notifications');
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
        // Use mock API
        await fetchWithAuth(`/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Impossible de marquer la notification comme lue');
    }
  }
  
  static async addNotification(notification: { 
    title: string; 
    message: string; 
    type: 'info' | 'warning' | 'alert';
  }): Promise<void> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        const { error } = await NotificationService.getSupabase()!
          .from('notifications')
          .insert({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            date: new Date().toISOString(),
            read: false,
            user_id: NotificationService.getSupabase()!.auth.getUser().then(data => data.data.user?.id || 'unknown')
          });

        if (error) throw error;
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
      // We don't want to block the main flow if notification fails
      console.log('Failed to add notification but continuing flow');
    }
  }
}
