
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Car, FileText } from "lucide-react";
import { toast } from "sonner";

interface VignettePaymentProps {
  accounts: any[];
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

const VignettePayment: React.FC<VignettePaymentProps> = ({ 
  accounts, 
  onSubmit,
  isSubmitting = false
}) => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("single");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount || !vehicleType || !licensePlate || !amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const paymentData = {
      accountId: parseInt(selectedAccount),
      vehicleType,
      licensePlate,
      amount: parseFloat(amount),
      description: `Paiement vignette ${licensePlate}`
    };
    
    if (onSubmit) {
      onSubmit(paymentData);
    } else {
      // Simulation d'un paiement réussi
      toast.success("Paiement en cours de traitement", {
        description: `Vignette pour ${licensePlate}`
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-bank-primary" />
          <span>Paiement de Vignette</span>
        </CardTitle>
        <CardDescription>
          Payez votre vignette automobile rapidement et en toute sécurité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Vignette unique</TabsTrigger>
            <TabsTrigger value="multiple">Vignettes multiples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Compte source</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.balance.toLocaleString('fr-MA')} MAD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Type de véhicule</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger id="vehicleType">
                    <SelectValue placeholder="Sélectionnez le type de véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voiture">Voiture de tourisme</SelectItem>
                    <SelectItem value="utilitaire">Véhicule utilitaire</SelectItem>
                    <SelectItem value="moto">Motocyclette</SelectItem>
                    <SelectItem value="camion">Camion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Immatriculation</Label>
                <Input
                  id="licensePlate"
                  placeholder="123456-A-7"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (MAD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  "Payer la vignette"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="multiple" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-16 w-16 text-bank-gray-light mb-4" />
              <h3 className="text-lg font-medium mb-2">Paiement par lot</h3>
              <p className="text-bank-gray mb-4">
                Payez plusieurs vignettes en une seule opération en téléchargeant un fichier CSV
              </p>
              <Button>Télécharger un modèle CSV</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VignettePayment;
