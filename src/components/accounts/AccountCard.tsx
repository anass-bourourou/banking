
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AccountHistory {
  month: string;
  amount: number;
}

interface AccountCardProps {
  account: {
    id: number;
    name: string;
    number: string;
    balance: number;
    currency: string;
    history: AccountHistory[];
  };
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg">
          <p className="text-sm font-medium text-bank-gray">{label}</p>
          <p className="text-bank-primary font-medium">
            {payload[0].value.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} €
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
          <CreditCard className="h-5 w-5 text-bank-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-bank-gray">**** {account.number.slice(-4)}</div>
        <div className="mt-2 text-2xl font-bold">
          {account.balance.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} {account.currency}
        </div>
        
        <div className="mt-4 h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={account.history} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F7DEA" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0F7DEA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#0F7DEA" 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6 }}
              />
              <XAxis dataKey="month" hide />
              <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <button className="bank-button-secondary flex items-center px-3 py-2 text-sm">
            <span>Détails</span>
          </button>
          <button className="bank-button flex items-center px-3 py-2 text-sm">
            <span>Transférer</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
