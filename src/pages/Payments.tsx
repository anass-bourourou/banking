
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PaymentForm from '@/components/payments/PaymentForm';
import VignettePayment from '@/components/payments/VignettePayment';
import UpcomingPayments from '@/components/payments/UpcomingPayments';
import PaymentHistory from '@/components/payments/PaymentHistory';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { BillService } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { Loader2 } from 'lucide-react';

// Define types for payment data
interface UpcomingPayment {
  id: number;
  payee: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface PaymentHistoryItem {
  id: number;
  payee: string;
  amount: number;
  date: string;
  reference: string;
}

const Payments = () => {
  const [activeTab, setActiveTab] = useState("bills");
  
  // Fetch accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts
  });
  
  // Fetch bills
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['bills'],
    queryFn: BillService.getMoroccanBills
  });

  // Convert bills to upcoming payments format
  const upcomingPayments: UpcomingPayment[] = bills
    .filter(bill => bill.status === 'pending')
    .slice(0, 5)
    .map(bill => ({
      id: parseInt(bill.id) || Math.floor(Math.random() * 1000), // Convert to number or generate random ID
      payee: bill.description,
      amount: bill.amount,
      dueDate: new Date(bill.dueDate).toLocaleDateString('fr-MA'),
      status: 'À venir'
    }));

  // Convert paid bills to payment history format  
  const paymentHistory: PaymentHistoryItem[] = bills
    .filter(bill => bill.status === 'paid')
    .slice(0, 5)
    .map(bill => ({
      id: parseInt(bill.id) || Math.floor(Math.random() * 1000), // Convert to number or generate random ID
      payee: bill.description,
      amount: bill.amount,
      date: bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('fr-MA') : '-',
      reference: bill.reference
    }));

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Paiements</h1>
        <p className="text-bank-gray">Gérez vos factures et effectuez des paiements</p>
      </div>
      
      <Tabs defaultValue="bills" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills">Factures</TabsTrigger>
          <TabsTrigger value="recharge">Recharge</TabsTrigger>
          <TabsTrigger value="vignette">Vignette</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills" className="space-y-4">
          {isLoadingAccounts || isLoadingBills ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payer une facture</CardTitle>
                    <CardDescription>Remplissez le formulaire pour effectuer un paiement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentForm accounts={accounts} />
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <UpcomingPayments payments={upcomingPayments} />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <PaymentHistory payments={paymentHistory} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="recharge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recharge mobile</CardTitle>
              <CardDescription>Rechargez votre téléphone mobile</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Recharge mobile form would go here */}
              <p>Service de recharge mobile en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vignette" className="space-y-4">
          {isLoadingAccounts ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <VignettePayment accounts={accounts} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Mes véhicules</CardTitle>
                  <CardDescription>Gérez vos véhicules et leurs vignettes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Service de gestion des véhicules en cours de développement</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Payments;
