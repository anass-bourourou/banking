
import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  transactionType: string;
  setTransactionType: (type: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  resetFilters: () => void;
}

const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  transactionType,
  setTransactionType,
  sortOrder,
  setSortOrder,
  resetFilters
}) => {
  return (
    <div className="border-b border-bank-gray-light p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-bank-gray" />
          </div>
          <Input
            type="text"
            placeholder="Rechercher..."
            className="bank-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="bank-input">
            <SelectValue placeholder="Type de transaction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="credit">Crédit</SelectItem>
            <SelectItem value="debit">Débit</SelectItem>
          </SelectContent>
        </Select>
        
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
            <SelectTrigger className="bank-input">
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
  );
};

export default TransactionsFilter;
