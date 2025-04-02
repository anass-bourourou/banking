
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, MinusCircle, Car, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VignetteEntry {
  id: string;
  matricule: string;
  type: string;
  amount: string;
}

interface MassVignettePaymentTabProps {
  isLoading: boolean;
  onPayVignettes: (vignettes: { matricule: string; type: string; amount: number }[]) => Promise<void>;
}

const MassVignettePaymentTab: React.FC<MassVignettePaymentTabProps> = ({
  isLoading,
  onPayVignettes
}) => {
  const [vignettes, setVignettes] = useState<VignetteEntry[]>([
    { id: Date.now().toString(), matricule: '', type: '', amount: '' }
  ]);

  const handleAddVignette = () => {
    setVignettes([...vignettes, { 
      id: Date.now().toString(), 
      matricule: '', 
      type: '', 
      amount: '' 
    }]);
  };

  const handleRemoveVignette = (id: string) => {
    if (vignettes.length > 1) {
      setVignettes(vignettes.filter(item => item.id !== id));
    } else {
      toast.error('Vous devez avoir au moins une vignette');
    }
  };

  const handleVignetteChange = (id: string, field: keyof VignetteEntry, value: string) => {
    setVignettes(vignettes.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getTotalAmount = () => {
    return vignettes.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      return total + amount;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const invalidEntries = vignettes.filter(item => 
      !item.matricule || !item.type || !item.amount || parseFloat(item.amount) <= 0
    );
    
    if (invalidEntries.length > 0) {
      toast.error('Veuillez compléter toutes les informations', {
        description: 'Tous les champs sont obligatoires pour chaque vignette'
      });
      return;
    }
    
    try {
      const formattedVignettes = vignettes.map(item => ({
        matricule: item.matricule,
        type: item.type,
        amount: parseFloat(item.amount)
      }));
      
      await onPayVignettes(formattedVignettes);
      
      // Réinitialiser le formulaire après le succès
      setVignettes([{ id: Date.now().toString(), matricule: '', type: '', amount: '' }]);
    } catch (error) {
      console.error('Erreur lors du paiement des vignettes:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-bank-primary" />
          <div>
            <CardTitle>Paiement de vignettes multiples</CardTitle>
            <CardDescription>Payez plusieurs vignettes en une seule transaction</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {vignettes.map((vignette, index) => (
            <div key={vignette.id} className="space-y-4 rounded-lg border p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-medium text-bank-primary">
                Vignette {index + 1}
              </div>
              
              {vignettes.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleRemoveVignette(vignette.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <div className="space-y-2">
                <Label htmlFor={`matricule-${vignette.id}`}>Matricule</Label>
                <Input
                  id={`matricule-${vignette.id}`}
                  placeholder="123456-A-7"
                  value={vignette.matricule}
                  onChange={(e) => handleVignetteChange(vignette.id, 'matricule', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`type-${vignette.id}`}>Type de véhicule</Label>
                <Select 
                  value={vignette.type} 
                  onValueChange={(value) => handleVignetteChange(vignette.id, 'type', value)}
                >
                  <SelectTrigger id={`type-${vignette.id}`}>
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
                <Label htmlFor={`amount-${vignette.id}`}>Montant (MAD)</Label>
                <Input
                  id={`amount-${vignette.id}`}
                  type="number"
                  placeholder="0.00"
                  value={vignette.amount}
                  onChange={(e) => handleVignetteChange(vignette.id, 'amount', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVignette}
              className="flex items-center"
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une vignette
            </Button>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Montant total</div>
              <div className="text-lg font-bold text-bank-primary">
                {getTotalAmount().toLocaleString('fr-MA')} MAD
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              'Payer toutes les vignettes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MassVignettePaymentTab;
