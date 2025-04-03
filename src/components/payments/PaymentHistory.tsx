
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Receipt } from 'lucide-react';

interface PaymentHistoryItem {
  id: number;
  payee: string;
  amount: number;
  date: string;
  reference: string;
}

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des paiements</CardTitle>
        <CardDescription>Consultez vos paiements effectués</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{payment.payee}</p>
                  <div className="flex space-x-2 text-sm text-bank-gray">
                    <span>{payment.date}</span>
                    <span>•</span>
                    <span>{payment.reference}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-red-600">{payment.amount.toLocaleString('fr-MA')} MAD</p>
                <button className="rounded-full bg-bank-gray-light p-2 text-bank-dark hover:bg-bank-gray">
                  <Receipt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
