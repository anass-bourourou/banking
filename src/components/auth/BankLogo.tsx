
import React from 'react';

export const BankLogo: React.FC = () => {
  return (
    <div className="mb-8 text-center flex flex-col items-center">
      <img 
        src="/cih-bank-logo.png" 
        alt="CIH Bank" 
        className="h-16 mb-2" 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "/placeholder.svg";
          console.error("CIH Bank logo failed to load. Fallback to placeholder.");
        }}
      />
      <h1 className="text-3xl font-bold text-bank-primary">CIH Bank</h1>
      <p className="text-bank-gray">Votre banque en ligne sécurisée</p>
    </div>
  );
};
