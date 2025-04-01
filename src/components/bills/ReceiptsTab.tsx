
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, FileText, Check, Download, Loader2, Search, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bill } from '@/services/BillService';
import { BillReceiptService } from '@/services/BillReceiptService';
import { toast } from 'sonner';

interface ReceiptsTabProps {
  paidBills: Bill[];
}

const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  paidBills
}) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'DGI' | 'CIM' | 'OTHER'>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'amountAsc' | 'amountDesc'>('recent');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownloadReceipt = async (bill: Bill) => {
    try {
      setDownloadingId(bill.id);
      await BillReceiptService.downloadReceipt(bill);
    } catch (error) {
      toast.error("Échec du téléchargement du reçu");
      console.error("Download receipt error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredBills = paidBills.filter(bill => {
    const matchesSearch = 
      bill.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(bill.amount).includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || bill.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortOrder) {
      case 'recent':
        return new Date(b.paymentDate || '').getTime() - new Date(a.paymentDate || '').getTime();
      case 'oldest':
        return new Date(a.paymentDate || '').getTime() - new Date(b.paymentDate || '').getTime();
      case 'amountAsc':
        return a.amount - b.amount;
      case 'amountDesc':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortOrder('recent');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-green-600" />
          <div>
            <CardTitle>Reçus et Quittances</CardTitle>
            <CardDescription>Consultez et téléchargez vos reçus de paiement</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-bank-gray" />
              </div>
              <Input
                placeholder="Rechercher par référence ou description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'DGI' | 'CIM' | 'OTHER')}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de facture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="DGI">DGI</SelectItem>
                  <SelectItem value="CIM">CIM</SelectItem>
                  <SelectItem value="OTHER">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'recent' | 'oldest' | 'amountAsc' | 'amountDesc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="amountAsc">Montant croissant</SelectItem>
                  <SelectItem value="amountDesc">Montant décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || typeFilter !== 'all' || sortOrder !== 'recent') && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="flex items-center"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>

        {sortedBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium">Aucun reçu disponible</h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? "Aucun reçu ne correspond à vos critères de recherche" 
                : "Les reçus de vos paiements s'afficheront ici"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{bill.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>Ref: {bill.reference}</span>
                      <span className="hidden md:inline">•</span>
                      <span>{bill.type}</span>
                      <span className="hidden md:inline">•</span>
                      <span>{bill.paymentDate ? formatDate(bill.paymentDate) : '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="mr-2 font-medium">{bill.amount.toLocaleString('fr-MA')} MAD</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReceipt(bill)}
                    disabled={downloadingId === bill.id}
                  >
                    {downloadingId === bill.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceiptsTab;
