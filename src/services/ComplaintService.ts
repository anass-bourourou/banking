
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Complaint {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  category?: string;
  reference_id?: string;
  created_at: string;
  updated_at: string;
  response?: string;
  response_date?: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category?: string;
  reference_id?: string;
}

export class ComplaintService extends BaseService {
  static async getComplaints(): Promise<Complaint[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/complaints');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Complaint[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Impossible de récupérer les réclamations');
      throw new Error('Impossible de récupérer les réclamations');
    }
  }

  static async createComplaint(complaintData: ComplaintFormData): Promise<Complaint> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la réclamation');
      }
      
      const data = await response.json();
      toast.success('Réclamation enregistrée avec succès');
      return data as Complaint;
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast.error('Impossible de créer la réclamation');
      throw new Error('Impossible de créer la réclamation');
    }
  }
}
