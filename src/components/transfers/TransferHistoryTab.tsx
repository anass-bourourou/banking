
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Send, FileText, Search, Filter } from 'lucide-react';
import TransactionItem from '@/components/transfers/TransactionItem';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransferHistoryTabProps {
  transfers: any[];
  isLoading: boolean;
  onViewReceipt: (receipt: any) => void;
}

const TransferHistoryTab: React.FC<TransferHistoryTabProps> = ({
  transfers,
  isLoading,
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filtrer les virements selon la recherche et le type
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = 
      (transfer.description && transfer.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transfer.reference_id && transfer.reference_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transfer.recipient_name && transfer.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'standard' && transfer.transfer_type === 'standard') ||
      (filterType === 'instant' && transfer.transfer_type === 'instantané') ||
      (filterType === 'mass' && transfer.transfer_type === 'multiple');
    
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des virements</CardTitle>
        <CardDescription>Consultez vos virements précédents</CardDescription>
        
        {/* Ajout des filtres de recherche */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-bank-gray" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher un virement..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bank-input">
              <SelectValue placeholder="Type de virement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les virements</SelectItem>
              <SelectItem value="standard">Virements standards</SelectItem>
              <SelectItem value="instant">Virements instantanés</SelectItem>
              <SelectItem value="mass">Virements multiples</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
          </div>
        ) : filteredTransfers.length > 0 ? (
          <div className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <div key={transfer.id} className="flex flex-col">
                <TransactionItem transaction={transfer} />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => onViewReceipt(transfer)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Voir reçu</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Send className="h-12 w-12 text-bank-gray mb-3" />
            <h3 className="text-lg font-medium mb-1">Aucun virement trouvé</h3>
            <p className="text-bank-gray">Aucun virement ne correspond à votre recherche</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferHistoryTab;
