import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface BankStatement {
  id: string;
  accountId: number;
  accountName: string;
  period: string;
  date: string;
  fileUrl?: string;
}

export class StatementService extends BaseService {
  static async getStatements(): Promise<BankStatement[]> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select('*');

        if (error) throw error;
        
        // First cast to unknown, then to BankStatement[] to avoid type errors
        const statements = data as unknown as BankStatement[];
        return statements || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/statements');
        const data = await response.json();
        
        // First cast to unknown, then to BankStatement[] to avoid type errors
        const statements = data as unknown as BankStatement[];
        return statements || [];
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast.error('Impossible de récupérer les relevés bancaires');
      throw new Error('Impossible de récupérer les relevés bancaires');
    }
  }

  static async getStatementsByAccount(accountId: number): Promise<BankStatement[]> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select('*')
          .eq('account_id', accountId);

        if (error) throw error;
        
        // First cast to unknown, then to BankStatement[] to avoid type errors
        const statements = data as unknown as BankStatement[];
        return statements || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/statements/account/${accountId}`);
        const data = await response.json();
        
        // First cast to unknown, then to BankStatement[] to avoid type errors
        const statements = data as unknown as BankStatement[];
        
        // If we don't have actual data, use our mock data
        if (!statements || !Array.isArray(statements)) {
          // Return mock data filtered by account
          const mockData = [
            {
              id: '1',
              accountId: 1,
              accountName: 'Compte Courant',
              period: 'Octobre 2023',
              date: '01/11/2023',
            },
            {
              id: '2',
              accountId: 1,
              accountName: 'Compte Courant',
              period: 'Septembre 2023',
              date: '01/10/2023',
            },
            {
              id: '3',
              accountId: 1,
              accountName: 'Compte Courant',
              period: 'Août 2023',
              date: '01/09/2023',
            },
            {
              id: '4',
              accountId: 2,
              accountName: 'Compte Épargne',
              period: 'Octobre 2023',
              date: '01/11/2023',
            },
            {
              id: '5',
              accountId: 2,
              accountName: 'Compte Épargne',
              period: 'Septembre 2023',
              date: '01/10/2023',
            },
          ];
          
          return mockData.filter(statement => statement.accountId === accountId);
        }
        
        return statements;
      }
    } catch (error) {
      console.error(`Error fetching statements for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les relevés du compte');
      throw new Error('Impossible de récupérer les relevés du compte');
    }
  }

  static async downloadStatement(statementId: string): Promise<string> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // Implementation for real file download from Supabase Storage would go here
        return 'download_url';
      } else {
        // Mock download - in a real app, this would redirect to or return a file URL
        toast.success('Téléchargement du relevé démarré', {
          description: 'Le téléchargement devrait commencer sous peu'
        });
        return 'mock_download_url';
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
      toast.error('Impossible de télécharger le relevé');
      throw new Error('Impossible de télécharger le relevé');
    }
  }
}
