
import { BaseService } from './BaseService';

export interface ScannedDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'validé' | 'rejeté' | 'en_cours';
  thumbnailUrl?: string;
  rejectionReason?: string;
}

export class ScanService extends BaseService {
  static async getScanHistory(): Promise<ScannedDocument[]> {
    // Simulation d'un appel API vers le backend SpringBoot
    return this.fetch('/api/scans', { method: 'GET' });
  }

  static async uploadScannedDocument(file: File, title: string, description: string): Promise<ScannedDocument> {
    // Dans un cas réel, nous utiliserions FormData pour télécharger le fichier
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    
    // Simulation d'un appel API vers le backend SpringBoot
    return this.fetch('/api/scans/upload', { 
      method: 'POST', 
      body: formData 
    });
  }

  static async deleteScannedDocument(id: string): Promise<void> {
    // Simulation d'un appel API vers le backend SpringBoot
    return this.fetch(`/api/scans/${id}`, { method: 'DELETE' });
  }

  // Helper method to handle API calls
  private static async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      // Simulate API response with mock data when not using backend
      if (!this.useBackend()) {
        return await this.getMockResponse(endpoint, options);
      }
      
      // In a real scenario, we would make actual fetch calls to the backend
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Mock responses for development
  private static async getMockResponse(endpoint: string, options: RequestInit): Promise<any> {
    if (endpoint === '/api/scans' && options.method === 'GET') {
      return this.getMockScanHistory();
    } else if (endpoint === '/api/scans/upload' && options.method === 'POST') {
      const formData = options.body as FormData;
      return this.getMockUploadResponse(formData);
    } else if (endpoint.startsWith('/api/scans/') && options.method === 'DELETE') {
      return null; // Successful deletion returns void
    }
    throw new Error('Mock endpoint not found');
  }

  private static getMockScanHistory(): ScannedDocument[] {
    return [
      {
        id: '1',
        title: 'Relevé bancaire Mars 2025',
        description: 'Relevé mensuel du compte courant',
        fileName: 'releve_mars_2025.pdf',
        fileType: 'application/pdf',
        fileSize: 1245000,
        uploadDate: '2025-04-02T10:15:00Z',
        status: 'validé'
      },
      {
        id: '2',
        title: 'Facture électricité',
        description: 'Facture du premier trimestre',
        fileName: 'facture_electricite_Q1.pdf',
        fileType: 'application/pdf',
        fileSize: 890000,
        uploadDate: '2025-04-01T14:22:00Z',
        status: 'en_cours'
      },
      {
        id: '3',
        title: 'Contrat de bail',
        description: 'Contrat de location appartement',
        fileName: 'contrat_bail_2025.pdf',
        fileType: 'application/pdf',
        fileSize: 2450000,
        uploadDate: '2025-03-28T09:45:00Z',
        status: 'rejeté',
        rejectionReason: 'Document incomplet, page de signature manquante'
      }
    ];
  }

  private static getMockUploadResponse(formData: FormData): ScannedDocument {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    return {
      id: Math.random().toString(36).substring(2, 15),
      title,
      description,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'en_cours'
    };
  }
}
