
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
      if (SmsValidationService.useSupabase() && SmsValidationService.getSupabase()) {
        // Generate a validation code that will be valid for 10 minutes
        const validationData = {
          code: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
          isUsed: false,
          operationType
        };

        const { data, error } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .insert(validationData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de la création du code de validation');

        // Simulate sending SMS
        console.log(`[DEVELOPMENT] SMS code for ${operationType}: ${validationData.code}`);
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS à votre numéro de téléphone'
        });

        return data.id;
      } else {
        // Use backend API
        const response = await fetchWithAuth('/auth/request-sms', {
          method: 'POST',
          body: JSON.stringify({ operationType })
        });
        const data = await response.json();
        
        if (data && data.validationId) {
          toast.info('Code de validation envoyé', {
            description: 'Un code de validation a été envoyé par SMS à votre numéro de téléphone'
          });
          
          // For development, log the code
          console.log(`[DEVELOPMENT] SMS validation ID: ${data.validationId}, Code: ${data.code || '123456'}`);
          
          return data.validationId;
        }
        
        throw new Error('Erreur lors de la demande de code SMS');
      }
    } catch (error) {
      console.error('Error requesting SMS code:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }

  static async verifySmsCode(validationId: number, code: string): Promise<boolean> {
    try {
      if (SmsValidationService.useSupabase() && SmsValidationService.getSupabase()) {
        // Get the validation entry
        const { data: validation, error: fetchError } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .select('*')
          .eq('id', validationId)
          .single();

        if (fetchError) throw fetchError;
        if (!validation) throw new Error('Code de validation non trouvé');

        // Check if code is valid
        if (validation.isUsed) {
          throw new Error('Ce code a déjà été utilisé');
        }

        if (new Date(validation.expiresAt) < new Date()) {
          throw new Error('Ce code a expiré');
        }

        if (validation.code !== code) {
          throw new Error('Code de validation incorrect');
        }

        // Mark code as used
        const { error: updateError } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .update({ isUsed: true })
          .eq('id', validationId);

        if (updateError) throw updateError;

        return true;
      } else {
        // Use backend API
        const response = await fetchWithAuth('/auth/verify-sms', {
          method: 'POST',
          body: JSON.stringify({ validationId, code })
        });
        
        const data = await response.json();
        
        if (data && data.success === true) {
          return true;
        }
        
        throw new Error(data.message || 'Code de validation incorrect');
      }
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      toast.error('Validation échouée', {
        description: error instanceof Error ? error.message : 'Code de validation incorrect'
      });
      return false;
    }
  }
}
