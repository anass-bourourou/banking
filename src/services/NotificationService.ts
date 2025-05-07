
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  category?: string;
  link?: string;
  userId?: string;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/notifications');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des notifications');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Notification[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Impossible de récupérer les notifications');
      throw new Error('Impossible de récupérer les notifications');
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/notifications/read-all', {
        method: 'PUT'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}
