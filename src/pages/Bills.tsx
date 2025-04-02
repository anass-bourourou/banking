
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, Receipt, Car, CarTaxiFront } from 'lucide-react';
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
import { useBillPayment } from '@/hooks/useBillPayment';
import { AccountService } from '@/services/AccountService';
import { BillReceiptService } from '@/services/BillReceiptService';

const Bills = () => {
  const [selectedTab, setSelectedTab] = useState('unpaid');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const {
    unpaidBills,
    paidBills,
    isLoadingBills,
    isLoadingAccounts,
    accounts,
    showOTPModal,
    handlePayBill,
    handlePayVignette,
    handleValidateOTP,
    setShowOTPModal
  } = useBillPayment();

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
    if (!pendingAction || pendingAction.type !== 'massVignettes') {
      toast.error('Données de paiement invalides');
      return false;
    }
    
    try {
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
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="vignette" className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            <span>Vignette</span>
          </TabsTrigger>
          <TabsTrigger value="massVignette" className="flex items-center">
            <CarTaxiFront className="mr-2 h-4 w-4" />
            <span>Vignettes masse</span>
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
      
      {/* OTP Dialog pour les vignettes multiples */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validation du paiement des vignettes</DialogTitle>
          </DialogHeader>
          
          <OTPValidation 
            isOpen={showOTPDialog}
            onClose={() => setShowOTPDialog(false)}
            onValidate={handleValidateMassVignettesOTP}
            title="Validation du paiement"
            description="Veuillez saisir le code à 6 chiffres envoyé par SMS pour confirmer le paiement des vignettes"
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Bills;
