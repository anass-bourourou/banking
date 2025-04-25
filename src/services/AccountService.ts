
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  currency: string;
  history: { month: string; amount: number }[];
  phone_number?: string;
  email?: string;
  city?: string;
  country?: string;
  address?: string;
}

export class AccountService extends BaseService {
  static async getAccounts(): Promise<Account[]> {
    try {
      if (AccountService.useSupabase() && AccountService.getSupabase()) {
        const { data: accountsData, error: accountsError } = await AccountService.getSupabase()!
          .from('accounts')
          .select('*');

        if (accountsError) throw accountsError;

        if (!accountsData || accountsData.length === 0) {
          return [];
        }

        // Get account history for each account
        const accountsWithHistory: Account[] = await Promise.all(
          accountsData.map(async (account) => {
            const { data: historyData, error: historyError } = await AccountService.getSupabase()!
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
              })) || [],
              phone_number: account.phone_number,
              email: account.email,
              city: account.city,
              country: account.country,
              address: account.address
            };
          })
        );

        return accountsWithHistory;
      } else {
        // Use backend API
        const response = await fetchWithAuth('/api/accounts');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération des comptes');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
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
      if (AccountService.useSupabase() && AccountService.getSupabase()) {
        const { data: account, error: accountError } = await AccountService.getSupabase()!
          .from('accounts')
          .select('*')
          .eq('id', id)
          .single();

        if (accountError) throw accountError;
        if (!account) return null;

        // Get account history
        const { data: historyData, error: historyError } = await AccountService.getSupabase()!
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
          })) || [],
          phone_number: account.phone_number,
          email: account.email,
          city: account.city,
          country: account.country,
          address: account.address
        };
      } else {
        // Use backend API
        const response = await fetchWithAuth(`/api/accounts/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération du compte');
        }
        
        const data = await response.json();
        return data as Account;
      }
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      toast.error('Impossible de récupérer les détails du compte');
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async updateAccountBalance(accountId: number, data: { balance: number }): Promise<void> {
    try {
      if (AccountService.useSupabase() && AccountService.getSupabase()) {
        const { error } = await AccountService.getSupabase()!
          .from('accounts')
          .update({ balance: data.balance, updated_at: new Date().toISOString() })
          .eq('id', accountId);

        if (error) throw error;
      } else {
        // Use backend API
        const response = await fetchWithAuth(`/api/accounts/${accountId}/balance`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour du solde');
        }
      }
    } catch (error) {
      console.error(`Error updating account balance for ${accountId}:`, error);
      toast.error('Impossible de mettre à jour le solde du compte');
      throw new Error('Impossible de mettre à jour le solde du compte');
    }
  }
}
