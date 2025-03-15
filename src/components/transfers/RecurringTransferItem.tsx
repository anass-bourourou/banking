
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecurringTransferItemProps {
  title: string;
  beneficiary: string;
  frequency: string;
  amount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const RecurringTransferItem: React.FC<RecurringTransferItemProps> = ({
  title,
  beneficiary,
  frequency,
  amount,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <div className="flex space-x-2 text-sm text-bank-gray">
            <span>{beneficiary}</span>
            <span>•</span>
            <span>{frequency}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-red-600">
          -{amount.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €
        </p>
        <div className="mt-1 flex justify-end space-x-2">
          <Button 
            onClick={onEdit}
            className="rounded-full bg-bank-gray-light px-3 py-1 text-xs font-medium text-bank-dark hover:bg-bank-gray-light/80 h-auto"
            variant="ghost"
          >
            Modifier
          </Button>
          <Button 
            onClick={onDelete}
            className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 h-auto"
            variant="ghost"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecurringTransferItem;
