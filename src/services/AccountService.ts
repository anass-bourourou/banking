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

  static async updateAccountBalance(accountId: number, data: { balance: number }): Promise<void> {
    try {
      if (AccountService.useSupabase() && AccountService.getSupabase()) {
        const { error } = await AccountService.getSupabase()!
          .from('accounts')
          .update({ balance: data.balance, updated_at: new Date().toISOString() })
          .eq('id', accountId);

        if (error) throw error;
      } else {
        // Use mock API
        await fetchWithAuth(`/accounts/${accountId}/balance`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      }
    } catch (error) {
      console.error(`Error updating account balance for ${accountId}:`, error);
      toast.error('Impossible de mettre à jour le solde du compte');
      throw new Error('Impossible de mettre à jour le solde du compte');
    }
  }
}
