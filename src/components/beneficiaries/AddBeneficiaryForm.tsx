
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Beneficiary } from '@/services/BeneficiaryService';

interface AddBeneficiaryFormProps {
  newBeneficiary: Partial<Beneficiary>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddBeneficiary: () => void;
  onCancel: () => void;
  isAdding: boolean;
}

const AddBeneficiaryForm: React.FC<AddBeneficiaryFormProps> = ({ 
  newBeneficiary, 
  onInputChange, 
  onAddBeneficiary, 
  onCancel,
  isAdding
}) => {
  return (
    <div className="mb-6 rounded-xl border border-bank-gray-light p-4">
      <h3 className="mb-4 text-lg font-medium">Ajouter un bénéficiaire</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet *</Label>
          <Input
            id="name"
            name="name"
            className="bank-input"
            placeholder="Ex: Fatima Alaoui"
            value={newBeneficiary.name}
            onChange={onInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rib">RIB *</Label>
          <Input
            id="rib"
            name="rib"
            className="bank-input"
            placeholder="Ex: 190 810 00024 00012345678 90"
            value={newBeneficiary.rib}
            onChange={onInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bic">BIC/SWIFT *</Label>
          <Input
            id="bic"
            name="bic"
            className="bank-input"
            placeholder="Ex: BCMAMADC"
            value={newBeneficiary.bic}
            onChange={onInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (optionnel)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="bank-input"
            placeholder="Ex: fatima.alaoui@email.ma"
            value={newBeneficiary.email}
            onChange={onInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone (optionnel)</Label>
          <Input
            id="phone"
            name="phone"
            className="bank-input"
            placeholder="Ex: 06 12 34 56 78"
            value={newBeneficiary.phone}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={onCancel} 
          className="bank-button-secondary"
        >
          Annuler
        </button>
        <button 
          onClick={onAddBeneficiary} 
          className="bank-button flex items-center space-x-2"
          disabled={isAdding}
        >
          {isAdding ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Ajouter le bénéficiaire
        </button>
      </div>
    </div>
  );
};

export default AddBeneficiaryForm;
