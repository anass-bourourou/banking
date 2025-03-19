
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Account } from './AccountService';

export interface BankStatement {
  id: string;
  accountId: number;
  accountName: string;
  period: string;
  date: string;
  fileUrl?: string;
  status: 'available' | 'processing';
  downloadCount: number;
}

export class StatementService extends BaseService {
  static async getStatements(): Promise<BankStatement[]> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // Fetch statements with account info
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select(`
            id, 
            account_id,
            period,
            date,
            file_path,
            status,
            download_count,
            accounts (name)
          `)
          .order('date', { ascending: false });

        if (error) throw error;
        
        if (!data || data.length === 0) {
          return [];
        }

        // Transform data to match our BankStatement interface
        const statements: BankStatement[] = data.map(item => ({
          id: item.id,
          accountId: item.account_id,
          accountName: item.accounts?.[0]?.name || 'Unknown Account',
          period: item.period,
          date: item.date,
          fileUrl: item.file_path,
          status: item.status,
          downloadCount: item.download_count
        }));

        return statements;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/statements');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0 && 'period' in data[0]) {
          return data as BankStatement[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast.error('Impossible de récupérer les relevés bancaires');
      throw new Error('Impossible de récupérer les relevés bancaires');
    }
  }

  static async getStatementById(id: string): Promise<BankStatement | null> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select(`
            id, 
            account_id,
            period,
            date,
            file_path,
            status,
            download_count,
            accounts (name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          return null;
        }

        return {
          id: data.id,
          accountId: data.account_id,
          accountName: data.accounts?.[0]?.name || 'Unknown Account',
          period: data.period,
          date: data.date,
          fileUrl: data.file_path,
          status: data.status,
          downloadCount: data.download_count
        };
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/statements/${id}`);
        const data = await response.json();
        
        if (data && 'id' in data && 'period' in data) {
          return data as BankStatement;
        }
        
        return null;
      }
    } catch (error) {
      console.error(`Error fetching statement ${id}:`, error);
      toast.error('Impossible de récupérer le relevé bancaire');
      throw new Error('Impossible de récupérer le relevé bancaire');
    }
  }

  static async downloadStatement(id: string): Promise<void> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // First, get the statement to check if it exists and get fileUrl
        const { data: statement, error: getError } = await StatementService.getSupabase()!
          .from('statements')
          .select('id, file_path, download_count')
          .eq('id', id)
          .single();

        if (getError) throw getError;
        if (!statement) throw new Error('Relevé non trouvé');
        if (!statement.file_path) throw new Error('Aucun fichier disponible pour ce relevé');

        // Update download count
        const { error: updateError } = await StatementService.getSupabase()!
          .from('statements')
          .update({ download_count: (statement.download_count || 0) + 1 })
          .eq('id', id);

        if (updateError) throw updateError;

        // In a real app, we would get the file URL from storage
        // and initiate the download, but for demo purposes, we'll simulate it
        console.log(`Downloading statement ${id} from ${statement.file_path}`);
        
        // Simulate file download - in a real app, this would be:
        // window.open(statement.file_path, '_blank');
        // or
        // const { data: fileData, error: downloadError } = await StatementService.getSupabase()!
        //  .storage.from('statements').download(statement.file_path);
        toast.success('Téléchargement démarré', { 
          description: `Le relevé est en cours de téléchargement` 
        });
      } else {
        // Mock API
        await fetchWithAuth(`/statements/${id}/download`, {
          method: 'POST'
        });
        
        toast.success('Téléchargement démarré', { 
          description: `Le relevé est en cours de téléchargement` 
        });
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
      toast.error('Impossible de télécharger le relevé');
      throw new Error('Impossible de télécharger le relevé');
    }
  }
}
