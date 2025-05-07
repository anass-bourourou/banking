
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface EDocument {
  id: string;
  title: string;
  type: 'statement' | 'certificate' | 'attestation';
  date: string;
  downloadUrl?: string;
  fileSize?: number;
  category?: string;
}

export class EDocumentService extends BaseService {
  static async getDocuments(): Promise<EDocument[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/edocuments');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des documents');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as EDocument[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Impossible de récupérer les documents');
      throw error;
    }
  }

  static async getDocumentsByType(type: 'statement' | 'certificate' | 'attestation'): Promise<EDocument[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/edocuments/type/${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des documents');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as EDocument[];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ${type} documents:`, error);
      toast.error(`Impossible de récupérer les documents de type ${type}`);
      throw error;
    }
  }

  static async downloadDocument(documentId: string): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/edocuments/${documentId}/download`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast.success('Téléchargement du document démarré');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Impossible de télécharger le document');
      throw error;
    }
  }

  static async requestDocument(documentType: string, accountId: number): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/edocuments/request', {
        method: 'POST',
        body: JSON.stringify({
          type: documentType,
          accountId: accountId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de document');
      }
      
      toast.success('Demande envoyée', {
        description: 'Votre document sera bientôt disponible'
      });
    } catch (error) {
      console.error('Error requesting document:', error);
      toast.error('Impossible de traiter votre demande');
      throw error;
    }
  }
}
