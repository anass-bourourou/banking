
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';

const CardDisplay: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <div className="relative h-48 overflow-hidden rounded-t-xl bg-gradient-to-r from-bank-primary to-blue-500 p-6 text-white">
          <div className="absolute top-4 right-4 text-lg font-light">BankWise</div>
          <div className="mt-6 text-lg">Visa Premium</div>
          <div className="mt-1 text-lg font-light">**** **** **** 7890</div>
          <div className="absolute bottom-6 left-6">
            <div className="text-sm font-light">Valable jusqu'à</div>
            <div>12/25</div>
          </div>
          <div className="absolute bottom-6 right-6">
            <div className="font-medium">JEAN DUPONT</div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Carte Visa Premium</h3>
              <p className="text-sm text-bank-gray">Liée au compte courant</p>
            </div>
            <div className="flex space-x-2">
              <button className="bank-button-secondary flex items-center px-3 py-2 text-sm">
                <span>Paramètres</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="flex h-full items-center justify-center p-6 transition-all duration-300 hover:shadow-card-hover">
        <button className="flex flex-col items-center justify-center space-y-3 text-bank-gray">
          <PlusCircle size={48} className="text-bank-primary" />
          <span className="font-medium">Ajouter une nouvelle carte</span>
        </button>
      </Card>
    </div>
  );
};

export default CardDisplay;
