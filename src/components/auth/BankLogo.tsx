
import React from 'react';

export const BankLogo: React.FC = () => {
  return (
    <div className="mb-8 text-center flex flex-col items-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative h-16">
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-1 text-[#221F26]">CIH</span>
            <div className="flex flex-col">
              <div className="h-5 w-10 bg-[#D32F2F] mb-1 transform skew-x-[-20deg]"></div>
              <div className="h-5 w-10 bg-[#1EAEDB] transform skew-x-[-20deg]"></div>
            </div>
            <span className="text-3xl font-bold ml-1 text-[#221F26]">BANK</span>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-bank-primary mb-2">CIH BANK</h1>
      <p className="text-bank-gray">Votre banque en ligne sécurisée</p>
    </div>
  );
};
