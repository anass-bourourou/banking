
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  date: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  responses?: ComplaintResponse[];
}

export interface ComplaintResponse {
  id: string;
  text: string;
  date: string;
  from: 'customer' | 'bank';
  attachments?: string[];
}

export class ComplaintService extends BaseService {
  static async getComplaints(): Promise<Complaint[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/complaints');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des réclamations');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Complaint[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Impossible de récupérer les réclamations');
      return [];
    }
  }
  
  static async createComplaint(complaintData: { subject: string; category: string; description: string; }): Promise<Complaint> {
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
      
      toast.success('Réclamation envoyée', {
        description: 'Votre réclamation a été enregistrée avec succès'
      });
      
      return data as Complaint;
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast.error('Impossible de créer la réclamation');
      throw error;
    }
  }
  
  static async addComplaintResponse(complaintId: string, text: string): Promise<ComplaintResponse> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/complaints/${complaintId}/responses`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de la réponse');
      }
      
      const data = await response.json();
      
      toast.success('Réponse envoyée', {
        description: 'Votre réponse a été ajoutée à la réclamation'
      });
      
      return data as ComplaintResponse;
    } catch (error) {
      console.error('Error adding complaint response:', error);
      toast.error('Impossible d\'ajouter la réponse');
      throw error;
    }
  }
}
