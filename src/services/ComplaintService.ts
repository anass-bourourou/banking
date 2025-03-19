
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
      if (ComplaintService.useSupabase() && ComplaintService.getSupabase()) {
        const { data, error } = await ComplaintService.getSupabase()!
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/complaints');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as Complaint[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Impossible de récupérer les réclamations');
      throw new Error('Impossible de récupérer les réclamations');
    }
  }

  static async createComplaint(complaintData: ComplaintFormData): Promise<Complaint> {
    try {
      if (ComplaintService.useSupabase() && ComplaintService.getSupabase()) {
        const { data, error } = await ComplaintService.getSupabase()!
          .from('complaints')
          .insert({
            title: complaintData.title,
            description: complaintData.description,
            category: complaintData.category,
            reference_id: complaintData.reference_id,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        
        // Ajouter une notification
        await ComplaintService.getSupabase()!
          .from('notifications')
          .insert({
            title: 'Réclamation enregistrée',
            message: `Votre réclamation "${complaintData.title}" a bien été enregistrée et sera traitée prochainement.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
          });
          
        toast.success('Réclamation enregistrée avec succès');
        return data;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/complaints', {
          method: 'POST',
          body: JSON.stringify(complaintData)
        });
        
        const data = await response.json();
        toast.success('Réclamation enregistrée avec succès');
        return data as Complaint;
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast.error('Impossible de créer la réclamation');
      throw new Error('Impossible de créer la réclamation');
    }
  }
}
