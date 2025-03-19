
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
  status: 'available' | 'processing';
  downloadCount: number;
}

export class StatementService extends BaseService {
  static async getStatements(): Promise<BankStatement[]> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // Joindre la table des comptes pour obtenir le nom du compte
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select(`
            id,
            account_id as accountId,
            period,
            date,
            file_path as fileUrl,
            status,
            download_count as downloadCount,
            accounts!inner(name)
          `)
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Transformer les données pour correspondre à notre interface
        const statements = data.map(statement => ({
          ...statement,
          accountName: statement.accounts.name
        }));
        
        // Supprime la propriété accounts qui n'est pas dans notre interface
        statements.forEach(statement => {
          delete statement.accounts;
        });

        return statements as BankStatement[];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/statements');
        const data = await response.json();
        
        // Mock data if needed
        if (!data || !Array.isArray(data)) {
          return this.getMockStatements();
        }
        
        return data as BankStatement[];
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast.error('Impossible de récupérer les relevés bancaires');
      
      // Return mock data in case of error for demo purposes
      return this.getMockStatements();
    }
  }

  static async getStatementsByAccount(accountId: number): Promise<BankStatement[]> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // Joindre la table des comptes pour obtenir le nom du compte
        const { data, error } = await StatementService.getSupabase()!
          .from('statements')
          .select(`
            id,
            account_id as accountId,
            period,
            date,
            file_path as fileUrl,
            status,
            download_count as downloadCount,
            accounts!inner(name)
          `)
          .eq('account_id', accountId)
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Transformer les données pour correspondre à notre interface
        const statements = data.map(statement => ({
          ...statement,
          accountName: statement.accounts.name
        }));
        
        // Supprime la propriété accounts qui n'est pas dans notre interface
        statements.forEach(statement => {
          delete statement.accounts;
        });

        return statements as BankStatement[];
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/statements/account/${accountId}`);
        const data = await response.json();
        
        // If we don't have actual data, use our mock data
        if (!data || !Array.isArray(data)) {
          return this.getMockStatements().filter(statement => statement.accountId === accountId);
        }
        
        return data as BankStatement[];
      }
    } catch (error) {
      console.error(`Error fetching statements for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les relevés du compte');
      
      // Return filtered mock data in case of error for demo purposes
      return this.getMockStatements().filter(statement => statement.accountId === accountId);
    }
  }

  static async downloadStatement(statementId: string): Promise<string> {
    try {
      if (StatementService.useSupabase() && StatementService.getSupabase()) {
        // 1. Récupérer le relevé
        const { data: statement, error: statementError } = await StatementService.getSupabase()!
          .from('statements')
          .select('*')
          .eq('id', statementId)
          .single();

        if (statementError) throw statementError;
        if (!statement) throw new Error('Relevé non trouvé');

        // 2. Mettre à jour le compteur de téléchargements
        await StatementService.getSupabase()!
          .from('statements')
          .update({ download_count: statement.download_count + 1 })
          .eq('id', statementId);

        // 3. Récupérer l'URL du fichier depuis Supabase Storage
        if (statement.file_path) {
          const { data: fileData, error: fileError } = await StatementService.getSupabase()!
            .storage
            .from('statements')
            .createSignedUrl(statement.file_path, 60); // URL valide 60 secondes

          if (fileError) throw fileError;
          if (!fileData || !fileData.signedUrl) throw new Error('URL de téléchargement non disponible');

          toast.success('Téléchargement démarré', {
            description: `Relevé ${statement.period}`
          });

          return fileData.signedUrl;
        } else {
          // Générer un PDF si aucun fichier n'est disponible
          const pdfBlob = await this.generatePDF({
            id: statement.id,
            accountId: statement.account_id,
            accountName: 'Votre compte', // Idéalement, récupérer le nom du compte
            period: statement.period,
            date: statement.date,
            status: statement.status,
            downloadCount: statement.download_count
          });
          
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          toast.success('Téléchargement démarré', {
            description: `Relevé ${statement.period}`
          });
          
          return pdfUrl;
        }
      } else {
        // Get the statement to find its file URL
        const statements = await this.getStatements();
        const statement = statements.find(s => s.id === statementId);
        
        if (statement) {
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
  
  // Données de démonstration
  private static getMockStatements(): BankStatement[] {
    return [
      {
        id: '1',
        accountId: 1,
        accountName: 'Compte Courant',
        period: 'Octobre 2023',
        date: '01/11/2023',
        fileUrl: '/mock-statements/statement-oct-2023.pdf',
        status: 'available',
        downloadCount: 2
      },
      {
        id: '2',
        accountId: 1,
        accountName: 'Compte Courant',
        period: 'Septembre 2023',
        date: '01/10/2023',
        fileUrl: '/mock-statements/statement-sep-2023.pdf',
        status: 'available',
        downloadCount: 1
      },
      {
        id: '3',
        accountId: 1,
        accountName: 'Compte Courant',
        period: 'Août 2023',
        date: '01/09/2023',
        fileUrl: '/mock-statements/statement-aug-2023.pdf',
        status: 'available',
        downloadCount: 0
      },
      {
        id: '4',
        accountId: 2,
        accountName: 'Compte Épargne',
        period: 'Octobre 2023',
        date: '01/11/2023',
        fileUrl: '/mock-statements/statement-oct-2023-savings.pdf',
        status: 'available',
        downloadCount: 0
      },
      {
        id: '5',
        accountId: 2,
        accountName: 'Compte Épargne',
        period: 'Septembre 2023',
        date: '01/10/2023',
        fileUrl: '/mock-statements/statement-sep-2023-savings.pdf',
        status: 'available',
        downloadCount: 0
      },
    ];
  }
}
