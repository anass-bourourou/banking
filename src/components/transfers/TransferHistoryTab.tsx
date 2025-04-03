
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Send, FileText, Search, Filter, Calendar } from 'lucide-react';
import TransactionItem from '@/components/transfers/TransactionItem';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState('newest');

  // Formatter les dates pour la comparaison
  const formatDate = (dateString: string) => {
    // Vérifier si la date est au format "DD/MM/YYYY"
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    
    // Sinon, considérer que c'est une date ISO
    return new Date(dateString);
  };

  // Filtrer les virements selon la recherche, le type et les dates
  const filteredTransfers = transfers.filter(transfer => {
    // Vérifier si les propriétés existent pour éviter les erreurs
    const description = transfer.description || '';
    const reference = transfer.reference_id || '';
    const recipientName = transfer.recipient_name || '';
    const transferType = transfer.transfer_type || '';
    const transferDate = transfer.date ? formatDate(transfer.date) : new Date();

    // Filtrer par recherche
    const matchesSearch = 
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par type
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'standard' && transferType === 'standard') ||
      (filterType === 'instant' && transferType === 'instantané') ||
      (filterType === 'mass' && transferType === 'multiple');
    
    // Filtrer par date
    const matchesDateFrom = !dateFrom || transferDate >= dateFrom;
    const matchesDateTo = !dateTo || transferDate <= dateTo;
    
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  // Trier les virements
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    const dateA = a.date ? formatDate(a.date).getTime() : 0;
    const dateB = b.date ? formatDate(b.date).getTime() : 0;
    
    if (sortOrder === "newest") {
      return dateB - dateA;
    } else if (sortOrder === "oldest") {
      return dateA - dateB;
    } else if (sortOrder === "highest") {
      return (b.amount || 0) - (a.amount || 0);
    } else if (sortOrder === "lowest") {
      return (a.amount || 0) - (b.amount || 0);
    }
    return 0;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortOrder('newest');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des virements</CardTitle>
        <CardDescription>Consultez vos virements précédents</CardDescription>
        
        {/* Filtres de recherche */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'P', { locale: fr }) : 'Date de début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'P', { locale: fr }) : 'Date de fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex space-x-2">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="bank-input w-full">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="highest">Montant le plus élevé</SelectItem>
                  <SelectItem value="lowest">Montant le plus faible</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={resetFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
          </div>
        ) : sortedTransfers.length > 0 ? (
          <div className="space-y-4">
            {sortedTransfers.map((transfer) => (
              <div key={transfer.id} className="space-y-2">
                <TransactionItem 
                  transaction={transfer} 
                  detailed={true}
                  onClick={() => onViewReceipt(transfer)}
                />
                <div className="flex justify-end px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReceipt(transfer);
                    }}
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
