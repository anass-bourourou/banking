
import { supabase, isSupabaseConfigured } from './supabase';
import { fetchWithAuth, api } from './api';
import { toast } from 'sonner';

export interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  currency: string;
  history: { month: string; amount: number }[];
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  category?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  email?: string;
  phone?: string;
}

export interface TransferData {
  fromAccount: number;
  toAccount: number | string;
  amount: number;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  date: string;
  read: boolean;
  transactionId?: number;
}

export class DataService {
  // Helper to check if we should use Supabase or mock API
  private static useSupabase(): boolean {
    return isSupabaseConfigured();
  }

  static async getAccounts(): Promise<Account[]> {
    try {
      if (DataService.useSupabase()) {
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*');

        if (accountsError) throw accountsError;

        if (!accountsData || accountsData.length === 0) {
          return [];
        }

        // Get account history for each account
        const accountsWithHistory: Account[] = await Promise.all(
          accountsData.map(async (account) => {
            const { data: historyData, error: historyError } = await supabase
              .from('account_history')
              .select('*')
              .eq('account_id', account.id)
              .order('month');

            if (historyError) {
              console.error('Error fetching account history:', historyError);
              return {
                ...account,
                history: []
              };
            }

            return {
              id: account.id,
              name: account.name,
              number: account.number,
              balance: account.balance,
              currency: account.currency,
              history: historyData?.map(h => ({
                month: h.month,
                amount: h.amount
              })) || []
            };
          })
        );

        return accountsWithHistory;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/accounts');
        const data = await response.json();
        
        // Ensure the response matches the Account[] type
        if (Array.isArray(data) && data.length > 0 && 'balance' in data[0]) {
          return data as Account[];
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu pour les comptes');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Impossible de récupérer les comptes');
      throw new Error('Impossible de récupérer les comptes');
    }
  }

  static async getAccountById(id: number): Promise<Account | null> {
    try {
      if (DataService.useSupabase()) {
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', id)
          .single();

        if (accountError) throw accountError;
        if (!account) return null;

        // Get account history
        const { data: historyData, error: historyError } = await supabase
          .from('account_history')
          .select('*')
          .eq('account_id', id)
          .order('month');

        if (historyError) throw historyError;

        return {
          id: account.id,
          name: account.name,
          number: account.number,
          balance: account.balance,
          currency: account.currency,
          history: historyData?.map(h => ({
            month: h.month,
            amount: h.amount
          })) || []
        };
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/accounts/${id}`);
        const data = await response.json();
        
        // Ensure the response matches the Account type
        if (data && 'id' in data && 'balance' in data) {
          return data as Account;
        } else if (Array.isArray(data) && data.length > 0) {
          // If the API returns an array with one account, take the first one
          const account = data.find(acc => acc.id === id);
          if (account) return account as Account;
        }
        
        return null;
      }
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      toast.error('Impossible de récupérer les détails du compte');
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      if (DataService.useSupabase()) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/transactions/recent');
        const data = await response.json();
        
        // Ensure the response matches the Transaction[] type
        if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
          return data as Transaction[];
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu pour les transactions');
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Impossible de récupérer les transactions récentes');
      throw new Error('Impossible de récupérer les transactions récentes');
    }
  }

  static async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    try {
      if (DataService.useSupabase()) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', accountId)
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/transactions/account/${accountId}`);
        const data = await response.json();
        
        // Ensure the response matches the Transaction[] type
        if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
          return data as Transaction[];
        }
        
        return []; // Return empty array if no transactions
      }
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions du compte');
      throw new Error('Impossible de récupérer les transactions du compte');
    }
  }

  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      if (DataService.useSupabase()) {
        const { data, error } = await supabase
          .from('beneficiaries')
          .select('*');

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/beneficiaries');
        const data = await response.json();
        
        // Ensure the response matches the Beneficiary[] type
        if (Array.isArray(data) && data.length > 0 && 'iban' in data[0]) {
          return data as Beneficiary[];
        }
        
        return []; // Return empty array if no beneficiaries
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires');
      throw new Error('Impossible de récupérer les bénéficiaires');
    }
  }

  static async createTransfer(data: TransferData): Promise<any> {
    try {
      if (DataService.useSupabase()) {
        // Get the accounts
        const { data: fromAccount, error: fromError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', data.fromAccount)
          .single();

        if (fromError) throw fromError;
        if (!fromAccount) throw new Error('Compte source non trouvé');

        // Validate sufficient funds
        if (fromAccount.balance < data.amount) {
          throw new Error('Solde insuffisant pour effectuer ce virement');
        }

        // Start a transaction
        // Note: Supabase doesn't support true transactions in the client library
        // This is a simplified approach

        // 1. Update source account balance
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ 
            balance: fromAccount.balance - data.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.fromAccount);

        if (updateError) throw updateError;

        // 2. Record the transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            description: data.description || 'Virement',
            amount: data.amount,
            type: 'debit',
            date: new Date().toLocaleDateString('fr-FR'),
            account_id: data.fromAccount,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // 3. Create a notification for the transfer
        await supabase
          .from('notifications')
          .insert({
            title: 'Virement effectué',
            message: `Virement de ${data.amount.toLocaleString('fr-FR')}€ effectué avec succès.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
            user_id: fromAccount.user_id,
            transaction_id: transaction?.id
          });

        return {
          success: true,
          transferId: transaction?.id,
          date: new Date().toLocaleDateString('fr-FR'),
          status: 'completed',
          ...data
        };
      } else {
        // Use mock API
        const response = await fetchWithAuth('/transfers', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Impossible de réaliser le virement');
      throw new Error('Impossible de réaliser le virement');
    }
  }

  static async addBeneficiary(beneficiary: Omit<Beneficiary, 'id'>): Promise<Beneficiary> {
    try {
      if (DataService.useSupabase()) {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await supabase
          .from('beneficiaries')
          .insert({
            ...beneficiary,
            user_id: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de l\'ajout du bénéficiaire');

        return data;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/beneficiaries', {
          method: 'POST',
          body: JSON.stringify(beneficiary)
        });
        const data = await response.json();
        
        // Ensure the response includes an id
        if (data && 'id' in data) {
          return data as Beneficiary;
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu');
      }
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Impossible d\'ajouter le bénéficiaire');
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }

  static async getNotifications(): Promise<Notification[]> {
    try {
      if (DataService.useSupabase()) {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await supabase
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
        return await DataService.generateNotificationsFromTransactions();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to generating notifications from transactions
      return await DataService.generateNotificationsFromTransactions();
    }
  }
  
  private static async generateNotificationsFromTransactions(): Promise<Notification[]> {
    try {
      // Get recent transactions to generate notifications
      const transactions = await DataService.getRecentTransactions();
      
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
