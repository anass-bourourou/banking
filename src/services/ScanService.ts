
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
    return this.get('/api/scans');
  }

  static async uploadScannedDocument(file: File, title: string, description: string): Promise<ScannedDocument> {
    // Dans un cas réel, nous utiliserions FormData pour télécharger le fichier
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    
    // Simulation d'un appel API vers le backend SpringBoot
    return this.post('/api/scans/upload', formData);
  }

  static async deleteScannedDocument(id: string): Promise<void> {
    // Simulation d'un appel API vers le backend SpringBoot
    return this.delete(`/api/scans/${id}`);
  }
}
