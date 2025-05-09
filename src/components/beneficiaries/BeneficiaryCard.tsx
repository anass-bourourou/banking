
import React from 'react';
import { User, Edit2, Send, Trash2, Loader2 } from 'lucide-react';
import { Beneficiary } from '@/services/BeneficiaryService';

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
  deleteId: string | null;
}

const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({ 
  beneficiary, 
  onDelete, 
  isDeleting, 
  deleteId 
}) => {
  return (
    <div 
      className="rounded-xl border border-bank-gray-light p-4 transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="mb-3 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
          <User className="h-5 w-5 text-bank-primary" />
        </div>
        <div>
          <h3 className="font-medium">{beneficiary.name}</h3>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-bank-gray">RIB: </span>
          <span className="font-medium">{beneficiary.rib}</span>
        </div>
        <div>
          <span className="text-bank-gray">BIC: </span>
          <span className="font-medium">{beneficiary.bic}</span>
        </div>
        {beneficiary.email && (
          <div>
            <span className="text-bank-gray">Email: </span>
            <span className="font-medium">{beneficiary.email}</span>
          </div>
        )}
        {beneficiary.phone && (
          <div>
            <span className="text-bank-gray">Téléphone: </span>
            <span className="font-medium">{beneficiary.phone}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button className="rounded-full bg-bank-gray-light p-2 text-bank-dark hover:bg-bank-gray">
          <Edit2 size={16} />
        </button>
        <button className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90">
          <Send size={16} />
        </button>
        <button 
          onClick={() => onDelete(beneficiary.id, beneficiary.name)} 
          className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
          disabled={isDeleting}
        >
          {isDeleting && deleteId === beneficiary.id ? 
            <Loader2 size={16} className="animate-spin" /> : 
            <Trash2 size={16} />
          }
        </button>
      </div>
    </div>
  );
};

export default BeneficiaryCard;
