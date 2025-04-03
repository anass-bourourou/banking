
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import VignettePayment from '@/components/payments/VignettePayment';
import EDocuments from '@/components/payments/EDocuments';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog'; 
import { useTransfer } from '@/hooks/useTransfer';
import NewPaymentForm from '@/components/payments/NewPaymentForm';
import UpcomingPayments from '@/components/payments/UpcomingPayments';
import PaymentHistory from '@/components/payments/PaymentHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Payments = () => {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });
  
  const { 
    isSmsDialogOpen, 
    validateSms, 
    closeSmsDialog,
    requestValidation,
    isLoading
  } = useTransfer();

  // État pour afficher un paiement en cours
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  
  const upcomingPayments = [
    { id: 1, payee: 'EDF Électricité', amount: 87.45, dueDate: '25/10/2023', status: 'À venir' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, dueDate: '03/11/2023', status: 'À venir' },
    { id: 3, payee: 'Assurance Auto', amount: 65.30, dueDate: '15/11/2023', status: 'À venir' },
  ];
  
  const paymentHistory = [
    { id: 1, payee: 'EDF Électricité', amount: 92.30, date: '25/09/2023', reference: 'FACT-2309-EDF' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, date: '03/10/2023', reference: 'FACT-2310-ORG' },
    { id: 3, payee: 'SAUR Eau', amount: 43.75, date: '10/10/2023', reference: 'FACT-2310-SAUR' },
    { id: 4, payee: 'Assurance Habitation', amount: 28.50, date: '12/10/2023', reference: 'PRIME-OCT23' },
  ];

  // Fonction pour gérer un paiement (simulé)
  const handlePayment = (paymentData: any) => {
    setIsPaymentInProgress(true);
    // Simuler une demande de validation
    setTimeout(() => {
      const transferData = {
        fromAccountId: paymentData.accountId || accounts[0]?.id,
        amount: paymentData.amount || 100,
        motif: paymentData.description || "Paiement facture"
      };
      
      requestValidation(transferData);
      setIsPaymentInProgress(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Paiements</h1>
        <p className="text-bank-gray">Effectuez vos paiements et consultez l'historique</p>
      </div>
      
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="new">Nouveau paiement</TabsTrigger>
          <TabsTrigger value="vignette">Paiement vignette</TabsTrigger>
          <TabsTrigger value="upcoming">Paiements à venir</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="documents">E-Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <NewPaymentForm 
            accounts={accounts} 
            isLoadingAccounts={isLoadingAccounts}
            onSubmit={handlePayment}
            isSubmitting={isPaymentInProgress || isLoading}
          />
        </TabsContent>
        
        <TabsContent value="vignette">
          <VignettePayment 
            accounts={accounts}
            onSubmit={handlePayment}
            isSubmitting={isPaymentInProgress || isLoading}
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <EDocuments />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <UpcomingPayments payments={upcomingPayments} />
        </TabsContent>
        
        <TabsContent value="history">
          <PaymentHistory payments={paymentHistory} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isPaymentInProgress} onOpenChange={(open) => !open && setIsPaymentInProgress(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Traitement du paiement</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-primary"></div>
          </div>
          <p className="text-center text-sm text-bank-gray">Veuillez patienter pendant que nous traitons votre paiement...</p>
        </DialogContent>
      </Dialog>
      
      <OTPValidationDialog
        isOpen={isSmsDialogOpen}
        onClose={closeSmsDialog}
        onValidate={validateSms}
      />
    </AppLayout>
  );
};

export default Payments;
