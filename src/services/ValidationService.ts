
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { TransferData } from '@/types/transaction';

export class ValidationService extends BaseService {
  static async requestTransferValidation(
    transferData: TransferData, 
    phoneNumber: string
  ): Promise<{validationId: number}> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/transfers/validate', {
        method: 'POST',
        body: JSON.stringify({ transferData, phoneNumber })
      });
      const data = await response.json();
      
      if (data && data.validationId) {
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS'
        });
        
        // For development, log the validation code if provided in response
        if (process.env.NODE_ENV === 'development' && data.code) {
          console.log(`[DEVELOPMENT] SMS validation code: ${data.code}`);
        }
        
        return { validationId: data.validationId };
      }
      
      throw new Error('Erreur lors de la demande de code SMS');
    } catch (error) {
      console.error('Error requesting transfer validation:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }
}
