
import React from 'react';
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

const Payments = () => {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });
  
  const { 
    isSmsDialogOpen, 
    validateSms, 
    closeSmsDialog 
  } = useTransfer();
  
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

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Paiements</h1>
        <p className="text-bank-gray">Effectuez vos paiements et consultez l'historique</p>
      </div>
      
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
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
          />
        </TabsContent>
        
        <TabsContent value="vignette">
          <VignettePayment accounts={accounts} />
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
      
      <OTPValidationDialog
        isOpen={isSmsDialogOpen}
        onClose={closeSmsDialog}
        onValidate={validateSms}
      />
    </AppLayout>
  );
};

export default Payments;
