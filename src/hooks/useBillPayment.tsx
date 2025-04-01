
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BillService, Bill } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { SmsValidationService } from '@/services/SmsValidationService';
import { toast } from 'sonner';

export const useBillPayment = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [smsValidationId, setSmsValidationId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // Fetch bills data
  const { 
    data: bills, 
    isLoading: isLoadingBills, 
    refetch: refetchBills 
  } = useQuery({
    queryKey: ['moroccanBills'],
    queryFn: BillService.getMoroccanBills
  });

  // Fetch accounts data
  const { 
    data: accounts, 
    isLoading: isLoadingAccounts 
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts
  });
  
  // Derived data
  const unpaidBills = bills?.filter(bill => bill.status === 'pending') || [];
  const paidBills = bills?.filter(bill => bill.status === 'paid') || [];
  
  // Handle bill payment initiation
  const handlePayBill = async (bill: Bill) => {
    if (!accounts || accounts.length === 0) {
      toast.error("Aucun compte disponible pour le paiement");
      return;
    }

    // For simplicity, use the first account
    const accountId = accounts[0].id;
    setSelectedBill(bill);
    setSelectedAccountId(accountId);

    try {
      // Request SMS validation
      const response = await SmsValidationService.requestSmsValidation(
        'paiement_facture',
        {
          billId: bill.id,
          amount: bill.amount,
          accountId: accountId
        },
        accounts[0].phone_number || ''
      );

      setSmsValidationId(response.validationId);
      setShowOTPModal(true);
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error("Impossible de démarrer la validation par SMS");
    }
  };
  
  // Handle vignette payment initiation
  const handlePayVignette = async (matricule: string, type: string, amount: string) => {
    if (!accounts || accounts.length === 0) {
      toast.error("Aucun compte disponible pour le paiement");
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Le montant doit être un nombre positif");
      return;
    }
    
    // Utiliser le premier compte
    const accountId = accounts[0].id;
    setSelectedAccountId(accountId);

    try {
      // Request SMS validation pour la vignette
      const response = await SmsValidationService.requestSmsValidation(
        'paiement_vignette',
        {
          description: `Vignette ${type} - ${matricule}`,
          amount: parsedAmount,
          accountId: accountId
        },
        accounts[0].phone_number || ''
      );

      setSmsValidationId(response.validationId);
      setShowOTPModal(true);
    } catch (error) {
      console.error('Error requesting SMS validation:', error);
      toast.error("Impossible de démarrer la validation par SMS");
    }
  };
  
  // Handle OTP validation
  const handleValidateOTP = async (code: string) => {
    if (!selectedBill || !smsValidationId || !selectedAccountId) return false;

    try {
      // Verify SMS code
      const isValid = await SmsValidationService.verifySmsCode(
        smsValidationId,
        code
      );

      if (isValid) {
        // Pay the bill
        await BillService.payBill(selectedBill.id, selectedAccountId);
        refetchBills();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw error;
    }
  };
  
  return {
    bills,
    unpaidBills,
    paidBills,
    isLoadingBills,
    isLoadingAccounts,
    showOTPModal,
    smsValidationId,
    selectedBill,
    handlePayBill,
    handlePayVignette,
    handleValidateOTP,
    setShowOTPModal,
    refetchBills
  };
};
