
import React from 'react';
import { Beneficiary } from '@/services/BeneficiaryService';
import { User } from 'lucide-react';
import BeneficiaryCard from './BeneficiaryCard';

interface BeneficiaryListProps {
  beneficiaries: Beneficiary[];
  searchTerm: string;
  isLoading: boolean;
  onDelete: (id: string, name: string) => void;
  onAddClick: () => void;
  deletingId: string | null;
  isDeletingBeneficiary: boolean;
}

const BeneficiaryList: React.FC<BeneficiaryListProps> = ({
  beneficiaries,
  searchTerm,
  isLoading,
  onDelete,
  onAddClick,
  deletingId,
  isDeletingBeneficiary
}) => {
  const filteredBeneficiaries = beneficiaries?.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.rib.toLowerCase().replace(/\s/g, '').includes(searchTerm.toLowerCase().replace(/\s/g, ''))
  ) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bank-primary border-t-transparent"></div>
        </div>
        <p className="text-bank-gray">Chargement des bénéficiaires...</p>
      </div>
    );
  }

  if (filteredBeneficiaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
          <User size={24} className="text-bank-gray" />
        </div>
        <h3 className="mb-2 text-lg font-medium">Aucun bénéficiaire trouvé</h3>
        <p className="text-bank-gray">
          {searchTerm 
            ? "Aucun résultat ne correspond à votre recherche" 
            : "Vous n'avez pas encore ajouté de bénéficiaires"}
        </p>
        {!searchTerm && (
          <button 
            onClick={onAddClick} 
            className="bank-button mt-4"
          >
            Ajouter un bénéficiaire
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredBeneficiaries.map((beneficiary) => (
        <BeneficiaryCard
          key={beneficiary.id}
          beneficiary={beneficiary}
          onDelete={onDelete}
          isDeleting={isDeletingBeneficiary}
          deleteId={deletingId}
        />
      ))}
    </div>
  );
};

export default BeneficiaryList;
