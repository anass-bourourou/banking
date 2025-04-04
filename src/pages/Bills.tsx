import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, Receipt, Car, CarTaxiFront, Banknote, FileText } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from 'sonner';

import UnpaidBillsTab from '@/components/bills/UnpaidBillsTab';
import PaidBillsTab from '@/components/bills/PaidBillsTab';
import VignettePaymentTab from '@/components/bills/VignettePaymentTab';
import MassVignettePaymentTab from '@/components/bills/MassVignettePaymentTab';
import ReceiptsTab from '@/components/bills/ReceiptsTab';
import OTPValidation from '@/components/common/OTPValidation';
import NewPaymentForm from '@/components/payments/NewPaymentForm'; 
import UpcomingPayments from '@/components/payments/UpcomingPayments';
import PaymentHistory from '@/components/payments/PaymentHistory';
import { useBillPayment } from '@/hooks/useBillPayment';
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { BillReceiptService } from '@/services/BillReceiptService';

const Bills = () => {
  const [selectedTab, setSelectedTab] = useState('unpaid');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });
  
  const {
    unpaidBills,
    paidBills,
    isLoadingBills,
    handlePayBill,
    handlePayVignette,
    handleValidateOTP,
    showOTPModal,
    setShowOTPModal
  } = useBillPayment();

  // Données fictives pour les paiements à venir
  const upcomingPayments = [
    { id: 1, payee: 'EDF Électricité', amount: 87.45, dueDate: '25/10/2023', status: 'À venir' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, dueDate: '03/11/2023', status: 'À venir' },
    { id: 3, payee: 'Assurance Auto', amount: 65.30, dueDate: '15/11/2023', status: 'À venir' },
  ];
  
  // Données fictives pour l'historique des paiements
  const paymentHistory = [
    { id: 1, payee: 'EDF Électricité', amount: 92.30, date: '25/09/2023', reference: 'FACT-2309-EDF' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, date: '03/10/2023', reference: 'FACT-2310-ORG' },
    { id: 3, payee: 'SAUR Eau', amount: 43.75, date: '10/10/2023', reference: 'FACT-2310-SAUR' },
    { id: 4, payee: 'Assurance Habitation', amount: 28.50, date: '12/10/2023', reference: 'PRIME-OCT23' },
  ];

  // Handler pour la simulation de paiement
  const handlePayment = (paymentData: any) => {
    setPendingAction({
      type: 'payment',
      data: paymentData
    });
    setShowOTPDialog(true);
  };

  // Handler pour le paiement de vignettes multiples
  const handlePayMassVignettes = async (
    vignettes: { matricule: string; type: string; amount: number }[]
  ) => {
    try {
      if (accounts.length === 0) {
        toast.error('Aucun compte disponible pour le paiement');
        return;
      }
      
      const account = accounts[0]; // On utilise le premier compte par défaut
      const totalAmount = vignettes.reduce((sum, v) => sum + v.amount, 0);
      
      if (account.balance < totalAmount) {
        toast.error('Solde insuffisant', {
          description: `Votre solde (${account.balance} MAD) est inférieur au montant total (${totalAmount} MAD)`
        });
        return;
      }
      
      // Stocker les informations pour la validation OTP
      setPendingAction({
        type: 'massVignettes',
        vignettes,
        account
      });
      
      // Afficher le dialogue OTP
      setShowOTPDialog(true);
    } catch (error) {
      console.error('Erreur lors du paiement des vignettes multiples:', error);
      toast.error('Erreur lors du paiement');
    }
  };

  // Handler pour la validation OTP des vignettes multiples
  const handleValidateMassVignettesOTP = async (code: string): Promise<boolean> => {
    if (!pendingAction) {
      toast.error('Données de paiement invalides');
      return false;
    }
    
    try {
      if (pendingAction.type === 'massVignettes') {
        const { vignettes, account } = pendingAction;
        const totalAmount = vignettes.reduce((sum, v) => sum + v.amount, 0);
        
        // Simuler le paiement des vignettes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mettre à jour le solde du compte
        await AccountService.updateAccountBalance(
          account.id, 
          { balance: account.balance - totalAmount }
        );
        
        // Générer le reçu PDF
        await BillReceiptService.generateMassVignetteReceipt(vignettes, account);
        
        toast.success('Paiement des vignettes réussi', {
          description: `${vignettes.length} vignettes payées pour un total de ${totalAmount.toLocaleString('fr-MA')} MAD`
        });
      } else if (pendingAction.type === 'payment') {
        // Traitement des paiements réguliers
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Paiement effectué avec succès', {
          description: `Le paiement de ${pendingAction.data.amount} MAD a été traité`
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error validating payment:', error);
      toast.error('Échec du paiement');
      return false;
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Factures</h1>
        <p className="text-bank-gray">Consultez et payez vos factures</p>
      </div>

      <Tabs defaultValue="unpaid" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="unpaid" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>À payer</span>
            {unpaidBills.length > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                {unpaidBills.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            <span>Payées</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center">
            <Banknote className="mr-2 h-4 w-4" />
            <span>Nouveau</span>
          </TabsTrigger>
          <TabsTrigger value="vignette" className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            <span>Vignette</span>
          </TabsTrigger>
          <TabsTrigger value="massVignette" className="flex items-center">
            <CarTaxiFront className="mr-2 h-4 w-4" />
            <span>Vignettes masse</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>À venir</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" />
            <span>Reçus</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="mt-4 space-y-4">
          <UnpaidBillsTab 
            bills={unpaidBills}
            isLoading={isLoadingBills}
            isLoadingAccounts={isLoadingAccounts}
            onPayBill={handlePayBill}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          <PaidBillsTab 
            bills={paidBills}
            isLoading={isLoadingBills}
          />
        </TabsContent>
        
        <TabsContent value="new" className="mt-4">
          <NewPaymentForm 
            accounts={accounts} 
            isLoadingAccounts={isLoadingAccounts}
            onSubmit={handlePayment}
            isSubmitting={false}
          />
        </TabsContent>
        
        <TabsContent value="vignette" className="mt-4">
          <VignettePaymentTab 
            onPayVignette={handlePayVignette} 
            isLoading={isLoadingAccounts}
          />
        </TabsContent>
        
        <TabsContent value="massVignette" className="mt-4">
          <MassVignettePaymentTab 
            onPayVignettes={handlePayMassVignettes}
            isLoading={isLoadingAccounts}
          />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <UpcomingPayments payments={upcomingPayments} />
        </TabsContent>
        
        <TabsContent value="receipts" className="mt-4">
          <ReceiptsTab paidBills={paidBills} />
        </TabsContent>
      </Tabs>

      {/* OTP Modal pour le paiement des factures */}
      <OTPValidation 
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onValidate={handleValidateOTP}
        title="Validation du paiement"
        description="Veuillez saisir le code à 6 chiffres envoyé par SMS pour confirmer votre paiement"
      />
      
      {/* OTP Dialog pour les autres paiements */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validation du paiement</DialogTitle>
          </DialogHeader>
          
          <OTPValidation 
            isOpen={showOTPDialog}
            onClose={() => setShowOTPDialog(false)}
            onValidate={handleValidateMassVignettesOTP}
            title="Validation"
            description="Veuillez saisir le code à 6 chiffres envoyé par SMS pour confirmer l'opération"
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Bills;
