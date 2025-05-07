
import { fetchWithAuth } from './api';
import { TransferData } from '@/types/transaction';
import { toast } from 'sonner';

export class ValidationService {
  /**
   * Request SMS validation for a transfer
   */
  static async requestTransferValidation(
    transferData: TransferData,
    phoneNumber: string
  ): Promise<{ validationId: number; message: string }> {
    try {
      const response = await fetchWithAuth('/validations/transfer', {
        method: 'POST',
        body: JSON.stringify({
          transferData,
          phoneNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la demande de validation'
        );
      }

      const data = await response.json();
      return {
        validationId: data.validationId,
        message: data.message || 'Code de validation envoyé'
      };
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error('Erreur de validation', {
        description: 'Impossible de demander une validation SMS'
      });
      throw error;
    }
  }

  /**
   * Verify SMS validation code
   */
  static async verifyValidationCode(
    validationId: number,
    code: string
  ): Promise<boolean> {
    try {
      const response = await fetchWithAuth('/validations/verify', {
        method: 'POST',
        body: JSON.stringify({
          validationId,
          code
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Code de validation incorrect'
        );
      }

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  }
}
