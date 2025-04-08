
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Receipt, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Account } from '@/services/AccountService';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountBalanceInfoProps {
  account: Account;
}

const AccountBalanceInfo: React.FC<AccountBalanceInfoProps> = ({ account }) => {
  const navigate = useNavigate();
  
  // Calcul de l'évolution du solde sur le dernier mois
  const getBalanceGrowth = (): { percentage: number; amount: number } => {
    if (!account || account.history.length < 2) return { percentage: 0, amount: 0 };
    
    const currentBalance = account.balance;
    const previousBalance = account.history[account.history.length - 2].amount;
    const difference = currentBalance - previousBalance;
    const percentage = previousBalance !== 0 ? (difference / previousBalance) * 100 : 0;
    
    return { 
      percentage, 
      amount: difference 
    };
  };

  const balanceGrowth = getBalanceGrowth();

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Informations</CardTitle>
        <Wallet className="h-5 w-5 text-bank-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-bank-gray">Numéro de compte</p>
            <p className="font-medium">{account.number}</p>
          </div>
          
          <div>
            <p className="text-sm text-bank-gray">Solde actuel</p>
            <p className="text-2xl font-bold">
              {account.balance.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} {account.currency}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-bank-gray">Évolution mensuelle</p>
            <div className={`flex items-center ${
              balanceGrowth.percentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="text-lg font-bold">
                {balanceGrowth.percentage >= 0 ? '+' : ''}
                {balanceGrowth.percentage.toFixed(2)}%
              </span>
              <span className="ml-2">
                ({balanceGrowth.amount >= 0 ? '+' : ''}
                {balanceGrowth.amount.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} {account.currency})
              </span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button className="mr-2" onClick={() => navigate(`/transfers?fromAccount=${account.id}`)}>
              <Send className="mr-2 h-4 w-4" />
              Effectuer un virement
            </Button>
            
            <Button variant="outline" onClick={() => setActiveTab('statements')}>
              <Receipt className="mr-2 h-4 w-4" />
              Voir les relevés
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default AccountBalanceInfo;
