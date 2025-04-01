
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Bill } from '@/services/BillService';
import BillCard from './BillCard';

interface UnpaidBillsTabProps {
  bills: Bill[];
  isLoading: boolean;
  isLoadingAccounts: boolean;
  onPayBill: (bill: Bill) => void;
}

const UnpaidBillsTab: React.FC<UnpaidBillsTabProps> = ({
  bills,
  isLoading,
  isLoadingAccounts,
  onPayBill
}) => {
  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-medium">Aucune facture en attente</h3>
          <p className="text-bank-gray">Vous n'avez pas de factures à payer pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  // Filtrer par type
  const dgiUnpaidBills = bills.filter(bill => bill.type === 'DGI');
  const cimUnpaidBills = bills.filter(bill => bill.type === 'CIM');
  const otherUnpaidBills = bills.filter(bill => bill.type === 'OTHER');

  return (
    <>
      {/* Factures DGI */}
      {dgiUnpaidBills.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Factures DGI</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dgiUnpaidBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                isPaid={false}
                isLoading={isLoadingAccounts}
                onPayBill={onPayBill}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Factures CIM */}
      {cimUnpaidBills.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Factures CIM</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cimUnpaidBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                isPaid={false}
                isLoading={isLoadingAccounts}
                onPayBill={onPayBill}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Autres factures */}
      {otherUnpaidBills.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Autres Factures</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherUnpaidBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                isPaid={false}
                isLoading={isLoadingAccounts}
                onPayBill={onPayBill}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default UnpaidBillsTab;
