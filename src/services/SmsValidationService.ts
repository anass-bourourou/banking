
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface SmsValidation {
  id: number;
  code: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  operationType: 'transfer' | 'bill-payment' | 'settings-change';
}

export class SmsValidationService extends BaseService {
  static async requestSmsCode(operationType: 'transfer' | 'bill-payment' | 'settings-change'): Promise<number> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/auth/request-sms', {
        method: 'POST',
        body: JSON.stringify({ operationType })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de code SMS');
      }
      
      const data = await response.json();
      
      if (data && data.validationId) {
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS à votre numéro de téléphone'
        });
        
        // For development, log the code if included
        if (process.env.NODE_ENV === 'development' && data.code) {
          console.log(`[DEVELOPMENT] SMS validation ID: ${data.validationId}, Code: ${data.code}`);
        }
        
        return data.validationId;
      }
      
      throw new Error('Erreur lors de la demande de code SMS');
    } catch (error) {
      console.error('Error requesting SMS code:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }

  static async verifySmsCode(validationId: number, code: string): Promise<boolean> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/auth/verify-sms', {
        method: 'POST',
        body: JSON.stringify({ validationId, code })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code de validation incorrect');
      }
      
      const data = await response.json();
      
      if (data && data.success === true) {
        return true;
      }
      
      throw new Error(data.message || 'Code de validation incorrect');
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      toast.error('Validation échouée', {
        description: error instanceof Error ? error.message : 'Code de validation incorrect'
      });
      return false;
    }
  }
  
  static async requestSmsValidation(
    operationType: 'transfer' | 'bill-payment' | 'paiement_facture' | 'paiement_vignette',
    data: any,
    phoneNumber: string
  ): Promise<{validationId: number}> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/auth/request-sms-validation', {
        method: 'POST',
        body: JSON.stringify({ operationType, data, phoneNumber })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de code SMS');
      }
      
      const responseData = await response.json();
      
      if (responseData && responseData.validationId) {
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS'
        });
        
        // For development, log the code if included
        if (process.env.NODE_ENV === 'development' && responseData.code) {
          console.log(`[DEVELOPMENT] SMS validation code: ${responseData.code}`);
        }
        
        return { validationId: responseData.validationId };
      }
      
      throw new Error('Erreur lors de la demande de code SMS');
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }
}
