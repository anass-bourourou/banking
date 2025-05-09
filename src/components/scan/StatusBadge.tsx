
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'validé':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
          <Check className="mr-1 h-3 w-3" /> Validé
        </Badge>
      );
    case 'rejeté':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
          <X className="mr-1 h-3 w-3" /> Rejeté
        </Badge>
      );
    case 'en_cours':
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
          <Clock className="mr-1 h-3 w-3" /> En cours
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

export default StatusBadge;
