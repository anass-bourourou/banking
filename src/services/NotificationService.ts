
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { TransactionService, Transaction } from './TransactionService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  date: string;
  read: boolean;
  transactionId?: number;
}

export class NotificationService extends BaseService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      if (NotificationService.useSupabase() && NotificationService.getSupabase()) {
        // Get current user
        const { data: { user }, error: userError } = await NotificationService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await NotificationService.getSupabase()!
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // First try to fetch notifications from the server
        const response = await fetchWithAuth('/notifications');
        const data = await response.json();
        
        // Properly validate that the data matches the Notification[] type structure
        if (Array.isArray(data) && data.length > 0) {
          // Check if the first item has the required Notification properties
          const firstItem = data[0];
          if ('title' in firstItem && 'message' in firstItem && 
              'type' in firstItem && 'date' in firstItem && 
              'read' in firstItem) {
            // Use a more robust type conversion approach
            return data as unknown as Notification[];
          }
        }
        
        // If data doesn't match Notification[] structure, fall back to generating notifications
        return await NotificationService.generateNotificationsFromTransactions();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to generating notifications from transactions
      return await NotificationService.generateNotificationsFromTransactions();
    }
  }
  
  private static async generateNotificationsFromTransactions(): Promise<Notification[]> {
    try {
      // Get recent transactions to generate notifications
      const transactions = await TransactionService.getRecentTransactions();
      
      if (!transactions || transactions.length === 0) {
        return [];
      }
      
      // Generate notifications based on recent transactions
      const notifications: Notification[] = transactions.slice(0, 3).map((transaction, index) => {
        const isCredit = transaction.type === 'credit';
        return {
          id: `tr-${transaction.id}`,
          title: isCredit ? 'Dépôt reçu' : 'Paiement effectué',
          message: `${isCredit ? 'Réception de' : 'Paiement de'} ${transaction.amount.toLocaleString('fr-FR')}€ - ${transaction.description}`,
          type: 'info',
          date: transaction.date,
          read: false,
          transactionId: transaction.id
        };
      });
      
      // Add a few static notifications for demonstration
      notifications.push({
        id: 'sys-1',
        title: 'Solde faible',
        message: 'Votre compte Épargne atteindra bientôt le seuil minimum',
        type: 'warning',
        date: new Date().toISOString(),
        read: false
      });
      
      notifications.push({
        id: 'sys-2',
        title: 'Maintenance programmée',
        message: 'Une maintenance est prévue ce weekend. Certains services pourraient être indisponibles.',
        type: 'info',
        date: new Date().toISOString(),
        read: true
      });
      
      // Sort by date, newest first
      return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error generating notifications:', error);
      return [];
    }
  }
}
