
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface SmsValidationRequest {
  validationId: number;
  message: string;
  phoneNumber: string;
}

export class SmsValidationService {
  static async requestSmsValidation(
    operation: string,
    data: any,
    phoneNumber: string
  ): Promise<{ validationId: number; message: string }> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/validations/sms', {
        method: 'POST',
        body: JSON.stringify({
          operation,
          data,
          phoneNumber
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de validation');
      }
      
      const responseData = await response.json();
      
      return {
        validationId: responseData.validationId,
        message: responseData.message || 'Code de validation envoyé'
      };
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error('Erreur de validation', {
        description: 'Impossible de demander le code de validation SMS'
      });
      throw error;
    }
  }

  static async verifySmsCode(
    validationId: number,
    code: string
  ): Promise<boolean> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/validations/sms/verify', {
        method: 'POST',
        body: JSON.stringify({
          validationId,
          code
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code de validation incorrect');
      }
      
      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      throw error;
    }
  }
}
