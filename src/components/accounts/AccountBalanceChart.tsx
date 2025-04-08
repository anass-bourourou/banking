
import React from 'react';
import { Account } from '@/services/AccountService';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AccountBalanceChartProps {
  account: Account;
}

const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({ account }) => {
  // Données de graphique pour les 30 derniers jours (simulé)
  const generateDailyData = () => {
    const data = [];
    const today = new Date();
    const monthHistory = [...account.history].reverse();
    
    // Utiliser les données mensuelles comme référence
    let baseAmount = monthHistory.length > 0 ? monthHistory[0].amount : account.balance;
    
    // Générer des données quotidiennes sur 30 jours
    for (let i = 30; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      
      // Ajouter une variation aléatoire pour simuler les mouvements quotidiens
      const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // ±1%
      
      // Si on est au début d'un nouveau mois, utiliser la donnée mensuelle réelle
      const monthIndex = monthHistory.findIndex(
        h => h.month.toLowerCase() === day.toLocaleString('fr-fr', { month: 'long' }).toLowerCase()
      );
      
      if (monthIndex >= 0 && day.getDate() === 1) {
        baseAmount = monthHistory[monthIndex].amount;
      }
      
      const simulatedAmount = i === 0 ? account.balance : baseAmount * randomFactor;
      baseAmount = simulatedAmount;
      
      data.push({
        date: day.toLocaleDateString('fr-fr'),
        solde: Math.round(simulatedAmount * 100) / 100
      });
    }
    
    return data;
  };

  const dailyData = generateDailyData();

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Évolution du solde</CardTitle>
        <TrendingUp className="h-5 w-5 text-bank-primary" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value.split('/').reverse().join('-'));
                  return date.getDate().toString();
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${account.currency}`, 'Solde']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="solde" 
                stroke="#0F7DEA" 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </>
  );
};

export default AccountBalanceChart;
