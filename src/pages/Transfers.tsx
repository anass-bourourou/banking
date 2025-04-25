import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { BeneficiaryService } from '@/services/BeneficiaryService';
import { TransactionService } from '@/services/TransactionService';
import { TransferReceiptService } from '@/services/TransferReceiptService';

// Import our refactored components
import NewTransferTab from '@/components/transfers/NewTransferTab';
import TransferHistoryTab from '@/components/transfers/TransferHistoryTab';
import TransferReceiptDialog from '@/components/transfers/TransferReceiptDialog';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog';
import InstantTransferForm from '@/components/transfers/InstantTransferForm';
import MassTransferForm from '@/components/transfers/MassTransferForm';
import { useTransfer } from '@/hooks/useTransfer';

const Transfers = () => {
  // Use our custom hook for transfer operations
  const { 
    isSmsDialogOpen, 
    isReceiptDialogOpen,
    selectedReceipt,
    isLoading,
    requestValidation,
    validateSms,
    viewReceipt,
    closeSmsDialog,
    closeReceiptDialog,
  } = useTransfer({
    onSuccess: () => {
      refetchTransfers();
    }
  });
  
  // Fetch accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });

  // Fetch beneficiaries
  const { data: beneficiaries = [], isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: BeneficiaryService.getBeneficiaries,
  });

  // Fetch recent transfers - fix the queryFn
  const { data: recentTransfers = [], isLoading: isLoadingTransfers, refetch: refetchTransfers } = useQuery({
    queryKey: ['recentTransfers'],
    queryFn: () => TransactionService.getRecentTransactions(),
  });
  
  // Fetch transfer receipts (not used directly, but keeping for future reference)
  const { data: transferReceipts = [], isLoading: isLoadingReceipts } = useQuery({
    queryKey: ['transferReceipts'],
    queryFn: TransferReceiptService.getTransferReceipts,
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Virements</h1>
        <p className="text-bank-gray">Effectuez des virements rapidement et en toute sécurité</p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="new">Nouveau virement</TabsTrigger>
          <TabsTrigger value="instant">Virement instantané</TabsTrigger>
          <TabsTrigger value="mass">Virement multiple</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        {/* New Transfer Tab */}
        <TabsContent value="new">
          <NewTransferTab 
            accounts={accounts}
            beneficiaries={beneficiaries}
            onRequestValidation={requestValidation}
            isLoading={isLoading || isLoadingAccounts || isLoadingBeneficiaries}
          />
        </TabsContent>
        
        {/* Instant Transfer Tab */}
        <TabsContent value="instant">
          <InstantTransferForm 
            accounts={accounts} 
            beneficiaries={beneficiaries}
            onSubmit={requestValidation}
            isLoading={isLoading}
          />
        </TabsContent>
        
        {/* Mass Transfer Tab */}
        <TabsContent value="mass">
          <MassTransferForm 
            accounts={accounts} 
            beneficiaries={beneficiaries}
            onSubmit={requestValidation}
            isLoading={isLoading}
          />
        </TabsContent>
        
        {/* Transfer History Tab */}
        <TabsContent value="history">
          <TransferHistoryTab 
            transfers={recentTransfers}
            isLoading={isLoadingTransfers}
            onViewReceipt={viewReceipt}
          />
        </TabsContent>
      </Tabs>
      
      {/* OTP Validation Dialog */}
      <OTPValidationDialog 
        isOpen={isSmsDialogOpen}
        onClose={closeSmsDialog}
        onValidate={validateSms}
        isValidating={isLoading}
      />
      
      {/* Receipt Dialog */}
      <TransferReceiptDialog 
        isOpen={isReceiptDialogOpen}
        onClose={closeReceiptDialog}
        receipt={selectedReceipt}
      />
    </AppLayout>
  );
};

export default Transfers;
