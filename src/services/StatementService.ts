
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
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.STATEMENTS.LIST);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as BankStatement[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast.error('Impossible de récupérer les relevés');
      throw new Error('Impossible de récupérer les relevés');
    }
  }

  static async downloadStatement(statementId: string): Promise<void> {
    try {
      // Use SpringBoot backend API
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
    } catch (error) {
      console.error(`Error downloading statement ${statementId}:`, error);
      toast.error('Impossible de télécharger le relevé');
      throw new Error('Impossible de télécharger le relevé');
    }
  }
}
