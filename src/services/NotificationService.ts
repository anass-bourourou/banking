
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  date: string;
  category?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/notifications');
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

  static async markAsRead(id: string): Promise<void> {
    try {
      // Use SpringBoot backend API
      await fetchWithAuth(`/notifications/${id}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      toast.error('Impossible de marquer la notification comme lue');
      throw new Error('Impossible de marquer la notification comme lue');
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      // Use SpringBoot backend API
      await fetchWithAuth('/notifications/read-all', {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Impossible de marquer toutes les notifications comme lues');
      throw new Error('Impossible de marquer toutes les notifications comme lues');
    }
  }
  
  static async addNotification(notification: Omit<Notification, 'id' | 'read' | 'date'>): Promise<Notification> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...notification,
          read: false,
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de la notification');
      }
      
      const data = await response.json();
      return data as Notification;
    } catch (error) {
      console.error('Error adding notification:', error);
      toast.error('Impossible d\'ajouter la notification');
      throw new Error('Impossible d\'ajouter la notification');
    }
  }
}
