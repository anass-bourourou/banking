import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

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
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        const response = await fetchWithAuth(ENDPOINTS.STATEMENTS.LIST);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as BankStatement[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast.error('Impossible de récupérer les relevés');
      throw new Error('Impossible de récupérer les relevés');
    }
  }

  static async downloadStatement(statementId: string): Promise<void> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        const { data: statement, error: getError } = await StatementService.getSupabase()!
          .from('statements')
          .select('*')
          .eq('id', statementId)
          .single();

        if (getError) throw getError;
        if (!statement || !statement.fileUrl) {
          throw new Error('Le fichier n\'est pas disponible');
        }

        const { data, error: downloadError } = await StatementService.getSupabase()!
          .storage
          .from('statements')
          .download(statement.fileUrl);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relevé_${statement.period.replace(/ /g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        await StatementService.getSupabase()!
          .from('statements')
          .update({ downloadCount: statement.downloadCount + 1 })
          .eq('id', statementId);
      } else {
        const response = await fetchWithAuth(ENDPOINTS.STATEMENTS.DOWNLOAD(statementId), {
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relevé_${statementId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Error downloading statement ${statementId}:`, error);
      toast.error('Impossible de télécharger le relevé');
      throw new Error('Impossible de télécharger le relevé');
    }
  }
}
