
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Statements = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedYear, setSelectedYear] = useState(`${new Date().getFullYear()}`);
  
  const accounts = [
    { id: '1', name: 'Compte Courant' },
    { id: '2', name: 'Compte Épargne' },
    { id: '3', name: 'Compte Investissement' },
  ];
  
  const years = [
    { id: '2023', name: '2023' },
    { id: '2022', name: '2022' },
    { id: '2021', name: '2021' },
    { id: '2020', name: '2020' },
  ];
  
  const statements = [
    { id: 1, account: '1', period: 'Octobre 2023', date: '31/10/2023', year: '2023' },
    { id: 2, account: '1', period: 'Septembre 2023', date: '30/09/2023', year: '2023' },
    { id: 3, account: '1', period: 'Août 2023', date: '31/08/2023', year: '2023' },
    { id: 4, account: '1', period: 'Juillet 2023', date: '31/07/2023', year: '2023' },
    { id: 5, account: '1', period: 'Juin 2023', date: '30/06/2023', year: '2023' },
    { id: 6, account: '1', period: 'Mai 2023', date: '31/05/2023', year: '2023' },
    { id: 7, account: '2', period: 'Octobre 2023', date: '31/10/2023', year: '2023' },
    { id: 8, account: '2', period: 'Septembre 2023', date: '30/09/2023', year: '2023' },
    { id: 9, account: '2', period: 'Août 2023', date: '31/08/2023', year: '2023' },
    { id: 10, account: '3', period: 'Octobre 2023', date: '31/10/2023', year: '2023' },
    { id: 11, account: '3', period: 'Septembre 2023', date: '30/09/2023', year: '2023' },
    { id: 12, account: '3', period: 'Août 2023', date: '31/08/2023', year: '2023' },
    { id: 13, account: '1', period: 'Décembre 2022', date: '31/12/2022', year: '2022' },
    { id: 14, account: '1', period: 'Novembre 2022', date: '30/11/2022', year: '2022' },
    { id: 15, account: '1', period: 'Octobre 2022', date: '31/10/2022', year: '2022' },
  ];
  
  const getFilteredStatements = () => {
    return statements.filter(statement => 
      (selectedAccount === '' || statement.account === selectedAccount) &&
      (selectedYear === '' || statement.year === selectedYear)
    );
  };
  
  const handleDownload = (id: number) => {
    const statement = statements.find(s => s.id === id);
    toast.success('Relevé téléchargé', {
      description: `Le relevé ${statement?.period} a été téléchargé`,
    });
  };
  
  const handleView = (id: number) => {
    const statement = statements.find(s => s.id === id);
    toast.success('Ouverture du relevé', {
      description: `Consultation du relevé ${statement?.period}`,
    });
  };
  
  const filteredStatements = getFilteredStatements();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Relevés bancaires</h1>
        <p className="text-bank-gray">Consultez et téléchargez vos relevés de compte</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mes relevés bancaires</CardTitle>
          <CardDescription>Tous vos relevés mensuels en un seul endroit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="account-filter" className="font-medium">Compte</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger id="account-filter" className="bank-input">
                  <SelectValue placeholder="Tous les comptes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les comptes</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="year-filter" className="font-medium">Année</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-filter" className="bank-input">
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les années</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredStatements.length > 0 ? (
            <div className="space-y-4">
              {filteredStatements.map((statement) => (
                <div 
                  key={statement.id} 
                  className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                      <FileText className="h-5 w-5 text-bank-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {accounts.find(a => a.id === statement.account)?.name} - {statement.period}
                      </p>
                      <div className="flex items-center space-x-1 text-sm text-bank-gray">
                        <Calendar size={12} />
                        <span>{statement.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(statement.id)} 
                      className="rounded-full bg-bank-gray-light p-2 text-bank-dark hover:bg-bank-gray"
                      title="Consulter"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleDownload(statement.id)} 
                      className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                <FileText size={24} className="text-bank-gray" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Aucun relevé trouvé</h3>
              <p className="text-bank-gray">
                Aucun relevé bancaire ne correspond à vos critères de recherche
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Statements;
