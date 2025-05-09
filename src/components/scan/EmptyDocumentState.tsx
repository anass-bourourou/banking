
import React from 'react';
import { FileScan } from 'lucide-react';

interface EmptyDocumentStateProps {
  searchTerm: string;
}

const EmptyDocumentState: React.FC<EmptyDocumentStateProps> = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
        <FileScan size={24} className="text-bank-gray" />
      </div>
      <h3 className="mb-2 text-lg font-medium">Aucun document trouvé</h3>
      <p className="text-bank-gray">
        {searchTerm 
          ? "Aucun résultat ne correspond à votre recherche" 
          : "Vous n'avez pas encore scanné de documents"}
      </p>
    </div>
  );
};

export default EmptyDocumentState;
