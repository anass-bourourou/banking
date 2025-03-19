
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface SmsValidation {
  id: number;
  phone_number: string;
  verification_code: string;
  transaction_type: string;
  transaction_details: any;
  is_verified: boolean;
  created_at: string;
  expires_at: string;
}

export class SmsValidationService extends BaseService {
  static async requestSmsValidation(
    transactionType: string, 
    transactionDetails: any, 
    phoneNumber: string
  ): Promise<{ validationId: number }> {
    try {
      if (SmsValidationService.useSupabase() && SmsValidationService.getSupabase()) {
        // Génération d'un code à 6 chiffres
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Calcul de la date d'expiration (10 minutes à partir de maintenant)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        const { data, error } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .insert({
            phone_number: phoneNumber,
            verification_code: verificationCode,
            transaction_type: transactionType,
            transaction_details: transactionDetails,
            expires_at: expiresAt.toISOString(),
            is_verified: false
          })
          .select()
          .single();

        if (error) throw error;
        
        // Dans un environnement réel, on appellerait ici un service SMS pour envoyer le code
        console.log(`Code SMS envoyé au ${phoneNumber}: ${verificationCode}`);
        
        // Pour la démo, on affiche le code dans un toast
        toast.info(`Code de validation: ${verificationCode}`, {
          description: "Dans un environnement réel, ce code serait envoyé par SMS."
        });
        
        return { validationId: data.id };
      } else {
        // Mock SMS validation
        const mockResponse = { validationId: Math.floor(Math.random() * 10000) };
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        toast.info(`Code de validation: ${mockCode}`, {
          description: "Dans un environnement réel, ce code serait envoyé par SMS."
        });
        
        return mockResponse;
      }
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error('Impossible de demander la validation par SMS');
      throw new Error('Impossible de demander la validation par SMS');
    }
  }
  
  static async verifySmsCode(validationId: number, code: string): Promise<boolean> {
    try {
      if (SmsValidationService.useSupabase() && SmsValidationService.getSupabase()) {
        // Vérifier si le code est valide et non expiré
        const { data: validation, error: fetchError } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .select('*')
          .eq('id', validationId)
          .single();
          
        if (fetchError) throw fetchError;
        
        if (!validation) {
          throw new Error('Validation non trouvée');
        }
        
        // Vérifier si le code a expiré
        if (new Date() > new Date(validation.expires_at)) {
          throw new Error('Le code a expiré');
        }
        
        // Vérifier le code
        if (validation.verification_code !== code) {
          throw new Error('Code invalide');
        }
        
        // Marquer comme vérifié
        const { error: updateError } = await SmsValidationService.getSupabase()!
          .from('sms_validations')
          .update({ 
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', validationId);
          
        if (updateError) throw updateError;
        
        return true;
      } else {
        // Mock verification (accepte n'importe quel code pour la démo)
        return true;
      }
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Impossible de vérifier le code SMS');
      }
      
      return false;
    }
  }
}
