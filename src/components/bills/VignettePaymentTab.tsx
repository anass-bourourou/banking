
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Check } from 'lucide-react';

interface VignettePaymentTabProps {
  onPayVignette: (matricule: string, type: string, amount: string) => void;
}

const VignettePaymentTab: React.FC<VignettePaymentTabProps> = ({
  onPayVignette
}) => {
  const [showVignetteForm, setShowVignetteForm] = useState(false);
  const [vignetteMatricule, setVignetteMatricule] = useState('');
  const [vignetteAmount, setVignetteAmount] = useState('');
  const [vignetteType, setVignetteType] = useState('particulier');
  const [massVignetteUpload, setMassVignetteUpload] = useState(false);
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);
  
  const handlePayVignette = () => {
    onPayVignette(vignetteMatricule, vignetteType, vignetteAmount);
  };
  
  const handleMassVignetteSubmit = () => {
    if (!vignetteFile) {
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
    <>
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
    </>
  );
};

export default VignettePaymentTab;
