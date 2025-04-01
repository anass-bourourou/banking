
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VignettePaymentTabProps {
  isLoading: boolean;
  onPayVignette: (matricule: string, type: string, amount: string) => Promise<void>;
}

const VignettePaymentTab: React.FC<VignettePaymentTabProps> = ({
  isLoading,
  onPayVignette
}) => {
  const [matricule, setMatricule] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricule || !type || !amount) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Le montant doit être un nombre positif');
      return;
    }
    
    try {
      await onPayVignette(matricule, type, amount);
      setMatricule('');
      setType('');
      setAmount('');
    } catch (error) {
      console.error('Error paying vignette:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement de vignette</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              placeholder="123456-A-7"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de véhicule</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de véhicule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voiture_tourisme">Voiture de tourisme</SelectItem>
                <SelectItem value="vehicule_utilitaire">Véhicule utilitaire</SelectItem>
                <SelectItem value="moto">Motocyclette</SelectItem>
                <SelectItem value="camion">Camion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (MAD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              'Payer maintenant'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VignettePaymentTab;
