
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Bill } from '@/services/BillService';
import BillCard from './BillCard';
import { BillReceiptService } from '@/services/BillReceiptService';
import { toast } from 'sonner';

interface PaidBillsTabProps {
  bills: Bill[];
  isLoading: boolean;
}

const PaidBillsTab: React.FC<PaidBillsTabProps> = ({
  bills,
  isLoading
}) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownloadReceipt = async (bill: Bill) => {
    try {
      setDownloadingId(bill.id);
      await BillReceiptService.downloadReceipt(bill);
    } catch (error) {
      toast.error("Échec du téléchargement du reçu");
      console.error("Download receipt error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

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
          <h3 className="text-lg font-medium">Aucune facture payée</h3>
          <p className="text-bank-gray">Vous n'avez pas encore payé de factures</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          isPaid={true}
          isLoading={downloadingId === bill.id}
          onViewReceipt={() => handleDownloadReceipt(bill)}
        />
      ))}
    </div>
  );
};

export default PaidBillsTab;
