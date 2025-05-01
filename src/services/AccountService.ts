
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

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
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.ACCOUNTS.LIST);
      
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
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Impossible de récupérer les comptes');
      throw new Error('Impossible de récupérer les comptes');
    }
  }

  static async getAccountById(id: number): Promise<Account | null> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.ACCOUNTS.DETAIL(id));
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du compte');
      }
      
      const data = await response.json();
      return data as Account;
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      toast.error('Impossible de récupérer les détails du compte');
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async updateAccountBalance(accountId: number, data: { balance: number }): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`${ENDPOINTS.ACCOUNTS.DETAIL(accountId)}/balance`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du solde');
      }
    } catch (error) {
      console.error(`Error updating account balance for ${accountId}:`, error);
      toast.error('Impossible de mettre à jour le solde du compte');
      throw new Error('Impossible de mettre à jour le solde du compte');
    }
  }
}
