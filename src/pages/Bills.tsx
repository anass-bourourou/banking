
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, FileText, Clock, Check, AlertTriangle, BadgeCheck } from 'lucide-react';
import { BillService, Bill } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import OTPValidation from '@/components/common/OTPValidation';
import { SmsValidationService } from '@/services/SmsValidationService';

const Bills = () => {
  const [selectedTab, setSelectedTab] = useState('unpaid');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [smsValidationId, setSmsValidationId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const { data: bills, isLoading: isLoadingBills, refetch: refetchBills } = useQuery({
    queryKey: ['moroccanBills'],
    queryFn: BillService.getMoroccanBills
  });

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts
  });

  const unpaidBills = bills?.filter(bill => bill.status === 'pending') || [];
  const paidBills = bills?.filter(bill => bill.status === 'paid') || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Factures</h1>
        <p className="text-bank-gray">Consultez et payez vos factures</p>
      </div>

      <Tabs defaultValue="unpaid" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
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
        </TabsList>

        <TabsContent value="unpaid" className="mt-4">
          {isLoadingBills ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : unpaidBills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
                <h3 className="text-lg font-medium">Aucune facture en attente</h3>
                <p className="text-bank-gray">Vous n'avez pas de factures à payer pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unpaidBills.map((bill) => (
                <Card key={bill.id} className="overflow-hidden">
                  <CardHeader className="bg-bank-gray-light/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-bank-primary" />
                        <CardTitle className="text-lg">{bill.type}</CardTitle>
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        {formatDate(bill.dueDate)}
                      </div>
                    </div>
                    <CardDescription>{bill.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-bank-gray">Référence</span>
                      <span className="font-medium">{bill.reference}</span>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-bank-gray">Montant</span>
                      <span className="text-xl font-bold">
                        {bill.amount.toLocaleString('fr-MA')} MAD
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePayBill(bill)}
                      disabled={isLoadingAccounts}
                    >
                      {isLoadingAccounts ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Receipt className="mr-2 h-4 w-4" />
                      )}
                      Payer maintenant
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          {isLoadingBills ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : paidBills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
                <h3 className="text-lg font-medium">Aucune facture payée</h3>
                <p className="text-bank-gray">Vous n'avez pas encore payé de factures</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paidBills.map((bill) => (
                <Card key={bill.id} className="overflow-hidden">
                  <CardHeader className="bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">{bill.type}</CardTitle>
                      </div>
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <BadgeCheck className="mr-1 h-4 w-4" />
                        Payée
                      </div>
                    </div>
                    <CardDescription>{bill.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-bank-gray">Référence</span>
                      <span className="font-medium">{bill.reference}</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-bank-gray">Montant</span>
                      <span className="text-xl font-bold">
                        {bill.amount.toLocaleString('fr-MA')} MAD
                      </span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-bank-gray">Date de paiement</span>
                      <span className="font-medium">
                        {bill.paymentDate ? formatDate(bill.paymentDate) : '-'}
                      </span>
                    </div>
                    <Button variant="outline" className="mt-2 w-full">
                      <Receipt className="mr-2 h-4 w-4" />
                      Télécharger le reçu
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <OTPValidation 
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onValidate={handleValidateOTP}
        title="Validation du paiement"
        description="Veuillez saisir le code à 6 chiffres envoyé par SMS pour confirmer le paiement de votre facture"
      />
    </AppLayout>
  );
};

export default Bills;
