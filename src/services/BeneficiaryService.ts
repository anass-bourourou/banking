
import { BaseService } from './BaseService';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

export interface Beneficiary {
  id: string;
  name: string;
  rib: string;  // Changed from iban to rib
  bic?: string;
  email?: string;
  phone?: string;
  bank_name?: string;
  address?: string;
  favorite: boolean;
}

export class BeneficiaryService extends BaseService {
  // Static beneficiaries data
  private static beneficiaries: Beneficiary[] = [
    {
      id: "1",
      name: "Mohammed Alaoui",
      rib: "011810000000123456789012",
      bic: "BCMAMAMC",
      email: "mohammed.alaoui@example.com",
      phone: "+212 661234567",
      bank_name: "CIH Bank",
      favorite: true
    },
    {
      id: "2",
      name: "Fatima Benali",
      rib: "011810000000987654321098",
      bic: "BCMAMAMC",
      email: "fatima.benali@example.com",
      bank_name: "CIH Bank",
      favorite: false
    },
    {
      id: "3",
      name: "Ahmed Tazi",
      rib: "022810000000567890123456",
      bic: "BMCEMAMCXXX",
      bank_name: "BMCE Bank",
      favorite: true
    },
    {
      id: "4",
      name: "Nadia Chraibi",
      rib: "033810000000345678901234",
      bic: "SGMBMAMC",
      bank_name: "Société Générale",
      favorite: false
    }
  ];

  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      // Return static beneficiaries data
      return [...this.beneficiaries];
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires');
      throw new Error('Impossible de récupérer les bénéficiaires');
    }
  }

  static async addBeneficiary(beneficiary: Omit<Beneficiary, 'id' | 'favorite'>): Promise<Beneficiary> {
    try {
      // Create new beneficiary with ID and favorite false
      const newBeneficiary: Beneficiary = {
        ...beneficiary,
        id: (this.beneficiaries.length + 1).toString(),
        favorite: false
      };
      
      // Add to static beneficiaries
      this.beneficiaries.push(newBeneficiary);
      
      toast.success('Bénéficiaire ajouté avec succès', {
        description: `${beneficiary.name} a été ajouté à vos bénéficiaires`
      });
      
      return newBeneficiary;
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Impossible d\'ajouter le bénéficiaire');
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }

  static async updateBeneficiary(id: string, updates: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      // Find beneficiary
      const index = this.beneficiaries.findIndex(b => b.id === id);
      
      if (index === -1) {
        throw new Error('Bénéficiaire non trouvé');
      }
      
      // Update beneficiary
      this.beneficiaries[index] = {
        ...this.beneficiaries[index],
        ...updates
      };
      
      toast.success('Bénéficiaire mis à jour', {
        description: `Les informations de ${this.beneficiaries[index].name} ont été mises à jour`
      });
      
      return this.beneficiaries[index];
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      toast.error('Impossible de mettre à jour le bénéficiaire');
      throw new Error('Impossible de mettre à jour le bénéficiaire');
    }
  }

  static async deleteBeneficiary(id: string): Promise<void> {
    try {
      // Find beneficiary
      const index = this.beneficiaries.findIndex(b => b.id === id);
      
      if (index === -1) {
        throw new Error('Bénéficiaire non trouvé');
      }
      
      // Remove from array
      this.beneficiaries.splice(index, 1);
      
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
      // Find beneficiary
      const index = this.beneficiaries.findIndex(b => b.id === id);
      
      if (index === -1) {
        throw new Error('Bénéficiaire non trouvé');
      }
      
      // Update favorite status
      this.beneficiaries[index].favorite = isFavorite;
      
      const message = isFavorite 
        ? `Le bénéficiaire a été ajouté aux favoris`
        : `Le bénéficiaire a été retiré des favoris`;
        
      toast.success('Favoris mis à jour', {
        description: message
      });
      
      return this.beneficiaries[index];
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Impossible de modifier le statut de favori');
      throw new Error('Impossible de modifier le statut de favori');
    }
  }

  static async getFavoriteBeneficiaries(): Promise<Beneficiary[]> {
    try {
      // Filter favorites
      return this.beneficiaries.filter(b => b.favorite);
    } catch (error) {
      console.error('Error fetching favorite beneficiaries:', error);
      toast.error('Impossible de récupérer les bénéficiaires favoris');
      throw new Error('Impossible de récupérer les bénéficiaires favoris');
    }
  }
}
