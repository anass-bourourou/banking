
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Send, FileText } from 'lucide-react';
import TransactionItem from '@/components/transfers/TransactionItem';

interface TransferHistoryTabProps {
  transfers: any[];
  isLoading: boolean;
  onViewReceipt: (receipt: any) => void;
}

const TransferHistoryTab: React.FC<TransferHistoryTabProps> = ({
  transfers,
  isLoading,
  onViewReceipt
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des virements</CardTitle>
        <CardDescription>Consultez vos virements précédents</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
          </div>
        ) : transfers.length > 0 ? (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="flex flex-col">
                <TransactionItem transaction={transfer} />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => onViewReceipt(transfer)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Voir reçu</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Send className="h-12 w-12 text-bank-gray mb-3" />
            <h3 className="text-lg font-medium mb-1">Aucun virement récent</h3>
            <p className="text-bank-gray">Vos virements récents s'afficheront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferHistoryTab;
