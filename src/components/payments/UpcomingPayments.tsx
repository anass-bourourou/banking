
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CalendarIcon } from 'lucide-react';

interface UpcomingPayment {
  id: number;
  payee: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ payments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiements à venir</CardTitle>
        <CardDescription>Consultez vos prochains paiements programmés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                    <CreditCard className="h-5 w-5 text-bank-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.payee}</p>
                    <p className="text-sm text-bank-gray">Échéance: {payment.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{payment.amount.toLocaleString('fr-MA')} MAD</p>
                  <div className="mt-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                    {payment.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                <CalendarIcon size={24} className="text-bank-gray" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Aucun paiement à venir</h3>
              <p className="text-bank-gray">
                Vous n'avez pas de paiements programmés
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
