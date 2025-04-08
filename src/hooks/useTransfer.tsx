
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TransferData } from '@/types/transaction';
import { TransferService } from '@/services/TransferService';
import { ValidationService } from '@/services/ValidationService';
import { toast } from 'sonner';

interface UseTransferOptions {
  onSuccess?: () => void;
}

export function useTransfer(options: UseTransferOptions = {}) {
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [smsValidationId, setSmsValidationId] = useState<number | null>(null);
  const [pendingTransferData, setPendingTransferData] = useState<TransferData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (transferData: TransferData) => {
      return TransferService.createTransfer(transferData);
    },
    onSuccess: () => {
      toast.success('Virement effectué avec succès', {
        description: pendingTransferData
          ? `Virement de ${pendingTransferData.amount.toLocaleString('fr-MA')} MAD envoyé`
          : 'Virement effectué',
      });
      
      // Reset state
      setIsSmsDialogOpen(false);
      setSmsValidationId(null);
      setPendingTransferData(null);
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      toast.error('Erreur lors du virement', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    },
  });

  // Mass transfer mutation
  const massTransferMutation = useMutation({
    mutationFn: (transferData: TransferData) => {
      return TransferService.createMassTransfer(transferData);
    },
    onSuccess: (data) => {
      toast.success('Virements multiples effectués avec succès', {
        description: `${data.recipientsCount} virements pour un total de ${data.totalAmount.toLocaleString('fr-MA')} MAD`,
      });
      
      // Reset state
      setIsSmsDialogOpen(false);
      setSmsValidationId(null);
      setPendingTransferData(null);
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      toast.error('Erreur lors des virements multiples', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    },
  });

  const handleRequestSmsValidation = async (transferData: TransferData) => {
    try {
      // Determine the phone number (in a real app, this would come from the account)
      const phoneNumber = '0600000000'; // This would normally be fetched from the account
      
      // Request SMS validation
      const { validationId } = await ValidationService.requestTransferValidation(
        transferData, 
        phoneNumber
      );
      
      // Save validation ID and transfer data
      setSmsValidationId(validationId);
      setPendingTransferData(transferData);
      
      // Open the dialog
      setIsSmsDialogOpen(true);
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error('Impossible de demander la validation par SMS');
    }
  };

  const handleSmsValidation = async (code: string): Promise<boolean> => {
    if (!smsValidationId || !pendingTransferData) {
      toast.error('Informations de validation incomplètes');
      return false;
    }
    
    try {
      // Add validation ID and code to the transfer data
      const transferDataWithValidation: TransferData = {
        ...pendingTransferData,
        smsValidationId,
        validationCode: code
      };
      
      // Call the appropriate mutation based on transfer type
      if (transferDataWithValidation.recipients && transferDataWithValidation.recipients.length > 0) {
        await massTransferMutation.mutateAsync(transferDataWithValidation);
      } else {
        await transferMutation.mutateAsync(transferDataWithValidation);
      }
      
      return true;
    } catch (error) {
      console.error('Error validating transfer:', error);
      return false;
    }
  };

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setIsReceiptDialogOpen(true);
  };

  return {
    // State
    isSmsDialogOpen,
    isReceiptDialogOpen,
    selectedReceipt,
    pendingTransferData,
    
    // Loading states
    isLoading: transferMutation.isPending || massTransferMutation.isPending,
    
    // Actions
    requestValidation: handleRequestSmsValidation,
    validateSms: handleSmsValidation,
    viewReceipt: handleViewReceipt,
    closeSmsDialog: () => setIsSmsDialogOpen(false),
    closeReceiptDialog: () => setIsReceiptDialogOpen(false),
    
    // Reset
    reset: () => {
      setIsSmsDialogOpen(false);
      setSmsValidationId(null);
      setPendingTransferData(null);
      setSelectedReceipt(null);
      setIsReceiptDialogOpen(false);
    }
  };
}
