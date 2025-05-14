
import { fetchWithAuth } from './api';
import { ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';

export interface ScanResult {
  id: string;
  type: 'cheque' | 'document' | 'id';
  status: 'pending' | 'validated' | 'rejected';
  amount?: number;
  date: string;
  reference?: string;
  imageUrl: string;
}

export class ScanService {
  /**
   * Upload a scanned check image
   */
  static async uploadCheckImage(imageFile: File): Promise<ScanResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('type', 'cheque');
      
      const response = await fetchWithAuth(ENDPOINTS.SCAN.UPLOAD, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type here as it will be automatically set with the boundary
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'upload du chèque');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Check scan upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Get scan history
   */
  static async getScanHistory(): Promise<ScanResult[]> {
    try {
      const response = await fetchWithAuth(ENDPOINTS.SCAN.HISTORY);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossible de récupérer l\'historique des scans');
      }
      
      const data = await response.json();
      return data as ScanResult[];
    } catch (error) {
      console.error('Failed to get scan history:', error);
      throw error;
    }
  }
  
  /**
   * Get mock scan history - for demonstration purposes
   */
  static getMockScanHistory(): ScanResult[] {
    return [
      {
        id: '1',
        type: 'cheque',
        status: 'validated',
        amount: 1500,
        date: '2025-05-10',
        reference: 'CHK20250510',
        imageUrl: '/placeholder.svg'
      },
      {
        id: '2',
        type: 'cheque',
        status: 'pending',
        amount: 750,
        date: '2025-05-12',
        reference: 'CHK20250512',
        imageUrl: '/placeholder.svg'
      },
      {
        id: '3',
        type: 'document',
        status: 'validated',
        date: '2025-05-08',
        reference: 'DOC20250508',
        imageUrl: '/placeholder.svg'
      }
    ];
  }
}
