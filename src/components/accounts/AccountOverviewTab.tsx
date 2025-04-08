
import React from 'react';
import { Account } from '@/services/AccountService';
import { Transaction } from '@/services/TransactionService';
import { Card } from "@/components/ui/card";
import AccountBalanceChart from './AccountBalanceChart';
import AccountBalanceInfo from './AccountBalanceInfo';
import AccountMovements from './AccountMovements';

interface AccountOverviewTabProps {
  account: Account;
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
}

const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({ 
  account, 
  transactions,
  setActiveTab
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <AccountBalanceChart account={account} />
        </Card>
        
        <Card>
          <AccountBalanceInfo account={account} setActiveTab={setActiveTab} />
        </Card>
      </div>
      
      <AccountMovements
        transactions={transactions || []}
        showFilters={false}
      />
    </div>
  );
};

export default AccountOverviewTab;
