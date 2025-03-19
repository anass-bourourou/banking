
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface TransferReceipt {
  id: number;
  transfer_id: number;
  transfer_type: 'standard' | 'multiple' | 'instantané';
  sender_account_id: number;
  recipient_details: any;
  amount: number;
  currency: string;
  motif?: string;
  fees: number;
  reference_number: string;
  status: string;
  execution_date: string;
  created_at: string;
}

export class TransferReceiptService extends BaseService {
  static async getTransferReceipts(): Promise<TransferReceipt[]> {
    try {
      if (TransferReceiptService.useSupabase() && TransferReceiptService.getSupabase()) {
        const { data, error } = await TransferReceiptService.getSupabase()!
          .from('transfer_receipts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/transfer-receipts');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as TransferReceipt[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching transfer receipts:', error);
      toast.error('Impossible de récupérer les reçus de virement');
      throw new Error('Impossible de récupérer les reçus de virement');
    }
  }
  
  static async getTransferReceiptById(id: number): Promise<TransferReceipt | null> {
    try {
      if (TransferReceiptService.useSupabase() && TransferReceiptService.getSupabase()) {
        const { data, error } = await TransferReceiptService.getSupabase()!
          .from('transfer_receipts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } else {
        // Use mock API
        const response = await fetchWithAuth(`/transfer-receipts/${id}`);
        const data = await response.json();
        return data as TransferReceipt;
      }
    } catch (error) {
      console.error(`Error fetching transfer receipt ${id}:`, error);
      toast.error('Impossible de récupérer le reçu de virement');
      throw new Error('Impossible de récupérer le reçu de virement');
    }
  }
  
  static async generateTransferReceipt(
    transferId: number,
    transferType: 'standard' | 'multiple' | 'instantané',
    accountId: number,
    recipientDetails: any,
    amount: number,
    motif?: string,
    fees: number = 0
  ): Promise<TransferReceipt> {
    try {
      const referenceNumber = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      if (TransferReceiptService.useSupabase() && TransferReceiptService.getSupabase()) {
        const { data, error } = await TransferReceiptService.getSupabase()!
          .from('transfer_receipts')
          .insert({
            transfer_id: transferId,
            transfer_type: transferType,
            sender_account_id: accountId,
            recipient_details: recipientDetails,
            amount: amount,
            currency: 'MAD',
            motif: motif,
            fees: fees,
            reference_number: referenceNumber,
            status: 'completed',
            execution_date: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Mock receipt generation
        const mockReceipt: TransferReceipt = {
          id: Math.floor(Math.random() * 10000),
          transfer_id: transferId,
          transfer_type: transferType,
          sender_account_id: accountId,
          recipient_details: recipientDetails,
          amount: amount,
          currency: 'MAD',
          motif: motif,
          fees: fees,
          reference_number: referenceNumber,
          status: 'completed',
          execution_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        return mockReceipt;
      }
    } catch (error) {
      console.error('Error generating transfer receipt:', error);
      // Ne pas bloquer le processus de virement si la génération du reçu échoue
      console.log('Failed to generate receipt but continuing transfer flow');
      throw new Error('Impossible de générer le reçu de virement');
    }
  }
}
