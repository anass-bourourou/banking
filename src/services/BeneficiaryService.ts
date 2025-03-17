
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  email?: string;
  phone?: string;
}

export class BeneficiaryService extends BaseService {
  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      if (BeneficiaryService.useSupabase() && BeneficiaryService.getSupabase()) {
        const { data, error } = await BeneficiaryService.getSupabase()!
          .from('beneficiaries')
          .select('*');

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/beneficiaries');
        const data = await response.json();
        
        // Ensure the response matches the Beneficiary[] type
        if (Array.isArray(data) && data.length > 0 && 'iban' in data[0]) {
          return data as Beneficiary[];
        }
        
        return []; // Return empty array if no beneficiaries
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires');
      throw new Error('Impossible de récupérer les bénéficiaires');
    }
  }

  static async addBeneficiary(beneficiary: Omit<Beneficiary, 'id'>): Promise<Beneficiary> {
    try {
      if (BeneficiaryService.useSupabase() && BeneficiaryService.getSupabase()) {
        // Get current user
        const { data: { user }, error: userError } = await BeneficiaryService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await BeneficiaryService.getSupabase()!
          .from('beneficiaries')
          .insert({
            ...beneficiary,
            user_id: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de l\'ajout du bénéficiaire');

        return data;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/beneficiaries', {
          method: 'POST',
          body: JSON.stringify(beneficiary)
        });
        const data = await response.json();
        
        // Ensure the response includes an id
        if (data && 'id' in data) {
          return data as Beneficiary;
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu');
      }
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Impossible d\'ajouter le bénéficiaire');
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }
}
