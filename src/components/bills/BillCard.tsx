
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileText, Banknote, BadgeCheck, Receipt, Loader2 } from 'lucide-react';
import { Bill } from '@/services/BillService';

interface BillCardProps {
  bill: Bill;
  isPaid: boolean;
  isLoading?: boolean;
  onPayBill?: (bill: Bill) => void;
  onViewReceipt?: () => void;
}

const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  isPaid, 
  isLoading = false,
  onPayBill,
  onViewReceipt
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determine card header style based on bill type
  const getHeaderStyle = () => {
    if (isPaid) return "bg-green-50";
    
    switch (bill.type) {
      case 'DGI': return "bg-amber-50";
      case 'CIM': return "bg-blue-50";
      default: return "bg-purple-50";
    }
  };

  // Determine icon color based on bill type
  const getIconColor = () => {
    if (isPaid) return "text-green-600";
    
    switch (bill.type) {
      case 'DGI': return "text-amber-600";
      case 'CIM': return "text-blue-600";
      default: return "text-purple-600";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`p-4 ${getHeaderStyle()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className={`h-5 w-5 ${getIconColor()}`} />
            <CardTitle className="text-lg">{bill.type}</CardTitle>
          </div>
          <div className={`text-sm font-medium ${isPaid ? 'text-green-600 flex items-center' : 'text-red-600'}`}>
            {isPaid ? (
              <>
                <BadgeCheck className="mr-1 h-4 w-4" />
                Payée
              </>
            ) : (
              formatDate(bill.dueDate)
            )}
          </div>
        </div>
        <CardDescription>{bill.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-bank-gray">Référence</span>
          <span className="font-medium">{bill.reference}</span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-bank-gray">Montant</span>
          <span className="text-xl font-bold">
            {bill.amount.toLocaleString('fr-MA')} MAD
          </span>
        </div>
        
        {isPaid && bill.paymentDate && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-bank-gray">Date de paiement</span>
            <span className="font-medium">
              {formatDate(bill.paymentDate)}
            </span>
          </div>
        )}
        
        {isPaid ? (
          <Button variant="outline" className="w-full" onClick={onViewReceipt}>
            <Receipt className="mr-2 h-4 w-4" />
            Télécharger le reçu
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onPayBill && onPayBill(bill)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Banknote className="mr-2 h-4 w-4" />
            )}
            Payer maintenant
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BillCard;
