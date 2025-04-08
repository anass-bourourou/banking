
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
      if (ValidationService.useSupabase() && ValidationService.getSupabase()) {
        const validationData = {
          code: Math.floor(100000 + Math.random() * 900000).toString(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          isUsed: false,
          operationType: 'transfer',
          transferData: JSON.stringify(transferData)
        };

        const { data, error } = await ValidationService.getSupabase()!
          .from('sms_validations')
          .insert(validationData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de la création du code de validation');
        
        console.log(`[DEVELOPMENT] SMS code for transfer: ${validationData.code}`);
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS'
        });

        return { validationId: data.id };
      } else {
        const response = await fetchWithAuth('/transfers/validate', {
          method: 'POST',
          body: JSON.stringify({ transferData, phoneNumber })
        });
        const data = await response.json();
        
        if (data && data.validationId) {
          toast.info('Code de validation envoyé', {
            description: 'Un code de validation a été envoyé par SMS'
          });
          return { validationId: data.validationId };
        }
        
        throw new Error('Erreur lors de la demande de code SMS');
      }
    } catch (error) {
      console.error('Error requesting transfer validation:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }
}
