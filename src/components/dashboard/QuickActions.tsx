
import React from 'react';
import { Send, Users, FileText, CreditCard, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Send,
      title: 'Nouveau virement',
      description: 'Effectuez un virement à un bénéficiaire',
      path: '/transfers',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      title: 'Ajouter bénéficiaire',
      description: 'Ajoutez un nouveau bénéficiaire',
      path: '/beneficiaries',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: FileText,
      title: 'Relevés bancaires',
      description: 'Consultez vos relevés bancaires',
      path: '/statements',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: CreditCard,
      title: 'Payer une facture',
      description: 'Réglez vos factures en ligne',
      path: '/payments',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Receipt,
      title: 'Factures DGI & CIM',
      description: 'Payez vos impôts et factures marocaines',
      path: '/moroccan-bills',
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.path}
          className="group overflow-hidden rounded-2xl bg-white p-5 shadow-card card-hover-effect"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110" 
               style={{ backgroundColor: action.color.split(' ')[0], color: action.color.split(' ')[1] }}>
            <action.icon size={24} />
          </div>
          <h3 className="text-lg font-medium text-bank-dark">{action.title}</h3>
          <p className="mt-2 text-sm text-bank-gray">{action.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
