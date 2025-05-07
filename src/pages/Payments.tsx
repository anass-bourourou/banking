
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { BillService } from '@/services/BillService';
import VignettePayment from '@/components/payments/VignettePayment';
import EDocuments from '@/components/payments/EDocuments';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog'; 
import { useTransfer } from '@/hooks/useTransfer';
import NewPaymentForm from '@/components/payments/NewPaymentForm';
import UpcomingPayments from '@/components/payments/UpcomingPayments';
import PaymentHistory from '@/components/payments/PaymentHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

const Payments = () => {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => AccountService.getAccounts(),
  });
  
  // Fetch bills from backend
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['bills'],
    queryFn: () => BillService.getMoroccanBills(),
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
  
  // Get upcoming payments from bills
  const upcomingPayments = bills
    .filter(bill => bill.status === 'pending')
    .slice(0, 5)
    .map(bill => ({
      id: bill.id,
      payee: bill.description,
      amount: bill.amount,
      dueDate: new Date(bill.dueDate).toLocaleDateString('fr-MA'),
      status: 'À venir'
    }));
  
  // Get payment history from bills
  const paymentHistory = bills
    .filter(bill => bill.status === 'paid')
    .slice(0, 5)
    .map(bill => ({
      id: bill.id,
      payee: bill.description,
      amount: bill.amount,
      date: bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('fr-MA') : '-',
      reference: bill.reference
    }));

  // Fonction pour gérer un paiement
  const handlePayment = (paymentData: any) => {
    setIsPaymentInProgress(true);
    
    const transferData = {
      fromAccountId: paymentData.accountId || accounts[0]?.id,
      amount: paymentData.amount || 100,
      motif: paymentData.description || "Paiement facture"
    };
    
    requestValidation(transferData);
    setIsPaymentInProgress(false);
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
          {isLoadingBills ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : (
            <UpcomingPayments payments={upcomingPayments} />
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {isLoadingBills ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : (
            <PaymentHistory payments={paymentHistory} />
          )}
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
