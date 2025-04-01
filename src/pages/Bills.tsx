
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, FileText, Clock, Check, AlertTriangle, BadgeCheck, Car, CreditCard, Banknote } from 'lucide-react';
import { BillService, Bill } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import OTPValidation from '@/components/common/OTPValidation';
import { SmsValidationService } from '@/services/SmsValidationService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Bills = () => {
  const [selectedTab, setSelectedTab] = useState('unpaid');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [smsValidationId, setSmsValidationId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // États pour le paiement de vignette
  const [showVignetteForm, setShowVignetteForm] = useState(false);
  const [vignetteMatricule, setVignetteMatricule] = useState('');
  const [vignetteAmount, setVignetteAmount] = useState('');
  const [vignetteType, setVignetteType] = useState('particulier');
  const [massVignetteUpload, setMassVignetteUpload] = useState(false);
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);

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
  
  // Filtrer par type
  const dgiUnpaidBills = unpaidBills.filter(bill => bill.type === 'DGI');
  const cimUnpaidBills = unpaidBills.filter(bill => bill.type === 'CIM');
  const otherUnpaidBills = unpaidBills.filter(bill => bill.type === 'OTHER');

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
  
  const handlePayVignette = async () => {
    if (!accounts || accounts.length === 0 || !vignetteMatricule || !vignetteAmount) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    const amount = parseFloat(vignetteAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Le montant doit être un nombre positif");
      return;
    }
    
    // Créer une "fausse" facture pour la vignette
    const vignetteData = {
      description: `Vignette ${vignetteType} - ${vignetteMatricule}`,
      amount: amount,
      type: 'OTHER' as 'DGI' | 'CIM' | 'OTHER'
    };
    
    // Utiliser le premier compte
    const accountId = accounts[0].id;
    setSelectedAccountId(accountId);

    try {
      // Request SMS validation pour la vignette
      const response = await SmsValidationService.requestSmsValidation(
        'paiement_vignette',
        {
          ...vignetteData,
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
  
  const handleMassVignetteSubmit = () => {
    if (!vignetteFile) {
      toast.error("Veuillez télécharger un fichier");
      return;
    }
    
    // Simuler le traitement du fichier
    toast.success("Fichier de vignettes en traitement", {
      description: "Vous recevrez une notification lorsque le traitement sera terminé."
    });
    
    // Réinitialiser le formulaire
    setVignetteFile(null);
    setMassVignetteUpload(false);
  };

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
            <>
              {/* Factures DGI */}
              {dgiUnpaidBills.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xl font-semibold">Factures DGI</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dgiUnpaidBills.map((bill) => (
                      <Card key={bill.id} className="overflow-hidden">
                        <CardHeader className="bg-amber-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-amber-600" />
                              <CardTitle className="text-lg">DGI</CardTitle>
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
                              <Banknote className="mr-2 h-4 w-4" />
                            )}
                            Payer maintenant
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Factures CIM */}
              {cimUnpaidBills.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-3 text-xl font-semibold">Factures CIM</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cimUnpaidBills.map((bill) => (
                      <Card key={bill.id} className="overflow-hidden">
                        <CardHeader className="bg-blue-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg">CIM</CardTitle>
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
                              <Banknote className="mr-2 h-4 w-4" />
                            )}
                            Payer maintenant
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Autres factures */}
              {otherUnpaidBills.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-3 text-xl font-semibold">Autres Factures</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {otherUnpaidBills.map((bill) => (
                      <Card key={bill.id} className="overflow-hidden">
                        <CardHeader className="bg-purple-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <CardTitle className="text-lg">Divers</CardTitle>
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
                              <Banknote className="mr-2 h-4 w-4" />
                            )}
                            Payer maintenant
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
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
        
        <TabsContent value="vignette" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Paiement de Vignette</CardTitle>
                  <CardDescription>Payez votre vignette automobile en ligne</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <Button 
                  variant={massVignetteUpload ? "outline" : "default"} 
                  className="flex-1 mr-2"
                  onClick={() => {
                    setMassVignetteUpload(false);
                    setShowVignetteForm(true);
                  }}
                >
                  Vignette individuelle
                </Button>
                <Button 
                  variant={massVignetteUpload ? "default" : "outline"} 
                  className="flex-1 ml-2"
                  onClick={() => {
                    setMassVignetteUpload(true);
                    setShowVignetteForm(true);
                  }}
                >
                  Vignettes en masse
                </Button>
              </div>
              
              {showVignetteForm && (
                massVignetteUpload ? (
                  <div className="space-y-4 rounded-lg border border-dashed border-gray-300 p-6">
                    <div className="text-center">
                      <Car className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                      <h3 className="mb-1 text-lg font-medium">Téléchargez votre fichier</h3>
                      <p className="text-sm text-gray-500">Formats acceptés: .xls, .xlsx, .csv</p>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <input
                        type="file"
                        id="vignetteFile"
                        className="hidden"
                        accept=".xls,.xlsx,.csv"
                        onChange={(e) => setVignetteFile(e.target.files ? e.target.files[0] : null)}
                      />
                      <label htmlFor="vignetteFile" className="cursor-pointer">
                        <div className="flex items-center space-x-2 rounded-md bg-bank-primary px-4 py-2 text-white">
                          <span>Sélectionner un fichier</span>
                        </div>
                      </label>
                    </div>
                    
                    {vignetteFile && (
                      <div className="mt-4 rounded-md bg-green-50 p-3">
                        <p className="flex items-center text-green-700">
                          <Check className="mr-2 h-4 w-4" />
                          Fichier sélectionné: {vignetteFile.name}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleMassVignetteSubmit} 
                      className="w-full" 
                      disabled={!vignetteFile}
                    >
                      Traiter le fichier
                    </Button>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Le fichier doit contenir les colonnes suivantes:</p>
                      <ul className="mt-1 list-inside list-disc">
                        <li>Matricule</li>
                        <li>Type véhicule</li>
                        <li>Montant</li>
                        <li>Propriétaire</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricule">Numéro d'immatriculation</Label>
                      <Input
                        id="matricule"
                        value={vignetteMatricule}
                        onChange={(e) => setVignetteMatricule(e.target.value)}
                        placeholder="123456 - W/A"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vignetteType">Type de véhicule</Label>
                      <Select 
                        value={vignetteType} 
                        onValueChange={setVignetteType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="particulier">Véhicule particulier</SelectItem>
                          <SelectItem value="utilitaire">Véhicule utilitaire</SelectItem>
                          <SelectItem value="transport">Transport en commun</SelectItem>
                          <SelectItem value="moto">Motocyclette</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          className="pl-12"
                          placeholder="0.00"
                          value={vignetteAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*[.,]?\d*$/.test(value)) {
                              setVignetteAmount(value);
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                          MAD
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handlePayVignette} 
                      className="w-full"
                      disabled={!vignetteMatricule || !vignetteAmount}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Payer la vignette
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Vignettes payées</CardTitle>
              <CardDescription>Historique de vos paiements de vignettes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Car className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">Aucune vignette payée</h3>
                <p className="text-gray-500">Vos vignettes payées s'afficheront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipts" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Reçus et Quittances</CardTitle>
                  <CardDescription>Consultez et téléchargez vos reçus de paiement</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {paidBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium">Aucun reçu disponible</h3>
                  <p className="text-gray-500">Les reçus de vos paiements s'afficheront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paidBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.description}</p>
                          <p className="text-sm text-gray-500">
                            {bill.paymentDate ? formatDate(bill.paymentDate) : '-'} • Réf: {bill.reference}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{bill.amount.toLocaleString('fr-MA')} MAD</span>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
