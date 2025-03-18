
import React from 'react';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
}

const TransactionHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2023-09-15',
      description: 'تحويل الراتب',
      amount: 5500.00,
      type: 'credit',
      category: 'دخل',
    },
    {
      id: '2',
      date: '2023-09-12',
      description: 'إيجار الشقة',
      amount: 3200.00,
      type: 'debit',
      category: 'سكن',
    },
    {
      id: '3',
      date: '2023-09-10',
      description: 'مشتريات مرجان',
      amount: 728.75,
      type: 'debit',
      category: 'تسوق',
    },
    {
      id: '4',
      date: '2023-09-08',
      description: 'مطعم المنزه',
      amount: 425.50,
      type: 'debit',
      category: 'مطاعم',
    },
    {
      id: '5',
      date: '2023-09-05',
      description: 'استرداد من سلمى',
      amount: 500.00,
      type: 'credit',
      category: 'أصدقاء',
    },
    {
      id: '6',
      date: '2023-09-01',
      description: 'فاتورة الكهرباء',
      amount: 450.25,
      type: 'debit',
      category: 'فواتير',
    },
  ];

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-bank-gray-light p-4 md:p-6">
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <h3 className="text-lg font-semibold text-bank-dark">المعاملات الأخيرة</h3>
          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-bank-gray" />
            </div>
            <input
              type="text"
              placeholder="البحث عن المعاملات..."
              className="h-10 w-full rounded-lg border-0 bg-bank-gray-light pl-10 pr-4 text-sm text-bank-dark focus:outline-none focus:ring-1 focus:ring-bank-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-bank-gray-light"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDown className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUp className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-bank-dark">{transaction.description}</p>
                    <p className="text-sm text-bank-gray">{transaction.category} • {formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'} 
                  {transaction.amount.toLocaleString('ar-MA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} د.م.
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-bank-gray">لم يتم العثور على أي معاملات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
