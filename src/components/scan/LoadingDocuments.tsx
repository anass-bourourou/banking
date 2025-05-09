
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingDocuments: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={32} className="mb-4 animate-spin text-bank-primary" />
      <p className="text-bank-gray">Chargement des documents...</p>
    </div>
  );
};

export default LoadingDocuments;
