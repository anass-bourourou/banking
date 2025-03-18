
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
              fileUrl: '/mock-statements/statement-oct-2023.pdf'
            },
            {
              id: '2',
              accountId: 1,
              accountName: 'Compte Courant',
              period: 'Septembre 2023',
              date: '01/10/2023',
              fileUrl: '/mock-statements/statement-sep-2023.pdf'
            },
            {
              id: '3',
              accountId: 1,
              accountName: 'Compte Courant',
              period: 'Août 2023',
              date: '01/09/2023',
              fileUrl: '/mock-statements/statement-aug-2023.pdf'
            },
            {
              id: '4',
              accountId: 2,
              accountName: 'Compte Épargne',
              period: 'Octobre 2023',
              date: '01/11/2023',
              fileUrl: '/mock-statements/statement-oct-2023-savings.pdf'
            },
            {
              id: '5',
              accountId: 2,
              accountName: 'Compte Épargne',
              period: 'Septembre 2023',
              date: '01/10/2023',
              fileUrl: '/mock-statements/statement-sep-2023-savings.pdf'
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
        // Get the statement to find its file URL
        const statements = await this.getStatements();
        const statement = statements.find(s => s.id === statementId);
        
        if (statement && statement.fileUrl) {
          // Create a PDF document
          const pdfBlob = await StatementService.generatePDF(statement);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Create a download link and trigger the download
          const downloadLink = document.createElement('a');
          downloadLink.href = pdfUrl;
          downloadLink.download = `Relevé-${statement.period}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up the URL object
          window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
          
          toast.success('Téléchargement du relevé démarré', {
            description: 'Le téléchargement devrait commencer sous peu'
          });
          
          return pdfUrl;
        } else {
          toast.success('Téléchargement du relevé démarré', {
            description: 'Le téléchargement devrait commencer sous peu'
          });
          return 'mock_download_url';
        }
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
      toast.error('Impossible de télécharger le relevé');
      throw new Error('Impossible de télécharger le relevé');
    }
  }
  
  // Méthode pour générer un PDF à partir d'un relevé bancaire
  private static async generatePDF(statement: BankStatement): Promise<Blob> {
    try {
      // Dans une vraie application, on utiliserait une bibliothèque comme jsPDF ou pdfmake
      // Pour ce mockup, on simule un délai et on retourne un blob simple
      return new Promise((resolve) => {
        setTimeout(() => {
          // Création d'un blob représentant un fichier PDF
          const pdfContent = `Relevé bancaire - ${statement.accountName}
Période: ${statement.period}
Date d'émission: ${statement.date}
ID du relevé: ${statement.id}
ID du compte: ${statement.accountId}

Ce document est un relevé bancaire généré automatiquement.
`;
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          resolve(blob);
        }, 500);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}
