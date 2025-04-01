
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Check, Receipt, Car } from 'lucide-react';
import { toast } from 'sonner';

import UnpaidBillsTab from '@/components/bills/UnpaidBillsTab';
import PaidBillsTab from '@/components/bills/PaidBillsTab';
import VignettePaymentTab from '@/components/bills/VignettePaymentTab';
import ReceiptsTab from '@/components/bills/ReceiptsTab';
import OTPValidation from '@/components/common/OTPValidation';
import { useBillPayment } from '@/hooks/useBillPayment';

const Bills = () => {
  const [selectedTab, setSelectedTab] = useState('unpaid');
  
  const {
    unpaidBills,
    paidBills,
    isLoadingBills,
    isLoadingAccounts,
    showOTPModal,
    handlePayBill,
    handlePayVignette,
    handleValidateOTP,
    setShowOTPModal
  } = useBillPayment();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Factures</h1>
        <p className="text-bank-gray">Consultez et payez vos factures</p>
      </div>

      <Tabs defaultValue="unpaid" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
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
            <span>Vignettes</span>
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
        
        <TabsContent value="receipts" className="mt-4">
          <ReceiptsTab paidBills={paidBills} />
        </TabsContent>
      </Tabs>

      <OTPValidation 
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onValidate={handleValidateOTP}
        title="Validation du paiement"
        description="Veuillez saisir le code à 6 chiffres envoyé par SMS pour confirmer votre paiement"
      />
    </AppLayout>
  );
};

export default Bills;
