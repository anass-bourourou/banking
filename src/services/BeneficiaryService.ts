
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
  bank_name?: string;
  address?: string;
  favorite: boolean;
}

export class BeneficiaryService extends BaseService {
  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/api/beneficiaries');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des bénéficiaires');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Beneficiary[];
      }
      
      return []; // Return empty array if no beneficiaries
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires');
      throw new Error('Impossible de récupérer les bénéficiaires');
    }
  }

  static async addBeneficiary(beneficiary: Omit<Beneficiary, 'id' | 'favorite'>): Promise<Beneficiary> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify(beneficiary)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout du bénéficiaire');
      }
      
      const data = await response.json();
      
      toast.success('Bénéficiaire ajouté avec succès', {
        description: `${beneficiary.name} a été ajouté à vos bénéficiaires`
      });
      
      return data as Beneficiary;
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Impossible d\'ajouter le bénéficiaire');
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }

  static async updateBeneficiary(id: string, updates: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/api/beneficiaries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du bénéficiaire');
      }
      
      if (data && 'id' in data) {
        toast.success('Bénéficiaire mis à jour', {
          description: `Les informations de ${data.name} ont été mises à jour`
        });
        return data as Beneficiary;
      }
      
      throw new Error('Format de réponse inattendu');
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      toast.error('Impossible de mettre à jour le bénéficiaire');
      throw new Error('Impossible de mettre à jour le bénéficiaire');
    }
  }

  static async deleteBeneficiary(id: string): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/api/beneficiaries/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du bénéficiaire');
      }
      
      toast.success('Bénéficiaire supprimé', {
        description: 'Le bénéficiaire a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      toast.error('Impossible de supprimer le bénéficiaire');
      throw new Error('Impossible de supprimer le bénéficiaire');
    }
  }

  static async toggleFavorite(id: string, isFavorite: boolean): Promise<Beneficiary> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/api/beneficiaries/${id}/favorite`, {
        method: 'PUT',
        body: JSON.stringify({ favorite: isFavorite })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification du statut de favori');
      }
      
      const data = await response.json();
      
      if (data && 'id' in data) {
        const message = isFavorite 
          ? `Le bénéficiaire a été ajouté aux favoris`
          : `Le bénéficiaire a été retiré des favoris`;
          
        toast.success('Favoris mis à jour', {
          description: message
        });
        return data as Beneficiary;
      }
      
      throw new Error('Format de réponse inattendu');
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Impossible de modifier le statut de favori');
      throw new Error('Impossible de modifier le statut de favori');
    }
  }

  static async getFavoriteBeneficiaries(): Promise<Beneficiary[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/api/beneficiaries/favorites');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des favoris');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Beneficiary[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching favorite beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires favoris');
      throw new Error('Impossible de récupérer les bénéficiaires favoris');
    }
  }
}
