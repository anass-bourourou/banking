
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, FileText, Check, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bill } from '@/services/BillService';
import { BillReceiptService } from '@/services/BillReceiptService';
import { toast } from 'sonner';

interface ReceiptsTabProps {
  paidBills: Bill[];
}

const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  paidBills
}) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-green-600" />
          <div>
            <CardTitle>Reçus et Quittances</CardTitle>
            <CardDescription>Consultez et téléchargez vos reçus de paiement</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paidBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium">Aucun reçu disponible</h3>
            <p className="text-gray-500">Les reçus de vos paiements s'afficheront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paidBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{bill.description}</p>
                    <p className="text-sm text-gray-500">
                      {bill.paymentDate ? formatDate(bill.paymentDate) : '-'} • Réf: {bill.reference}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{bill.amount.toLocaleString('fr-MA')} MAD</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReceipt(bill)}
                    disabled={downloadingId === bill.id}
                  >
                    {downloadingId === bill.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceiptsTab;
