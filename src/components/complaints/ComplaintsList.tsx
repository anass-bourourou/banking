
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Complaint } from '@/services/ComplaintService';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ComplaintsListProps {
  complaints: Complaint[];
  isLoading: boolean;
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({ complaints, isLoading }) => {
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'En attente', 
          icon: <Clock className="h-4 w-4" />, 
          color: 'bg-yellow-100 text-yellow-700'
        };
      case 'in_progress':
        return { 
          label: 'En cours de traitement', 
          icon: <AlertCircle className="h-4 w-4" />, 
          color: 'bg-blue-100 text-blue-700'
        };
      case 'resolved':
        return { 
          label: 'Résolu', 
          icon: <CheckCircle className="h-4 w-4" />, 
          color: 'bg-green-100 text-green-700'
        };
      case 'rejected':
        return { 
          label: 'Rejeté', 
          icon: <XCircle className="h-4 w-4" />, 
          color: 'bg-red-100 text-red-700'
        };
      default:
        return { 
          label: 'Statut inconnu', 
          icon: <AlertCircle className="h-4 w-4" />, 
          color: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes réclamations</CardTitle>
        <CardDescription>
          Historique et suivi de vos réclamations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bank-primary"></div>
          </div>
        ) : complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-lg border p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{complaint.title}</h3>
                      <p className="text-sm text-bank-gray">
                        {formatDate(complaint.created_at)}
                        {complaint.category && ` • ${complaint.category}`}
                        {complaint.reference_id && ` • Réf: ${complaint.reference_id}`}
                      </p>
                    </div>
                    <div>
                      {(() => {
                        const { label, icon, color } = getStatusDetails(complaint.status);
                        return (
                          <Badge className={`flex items-center space-x-1 ${color}`}>
                            {icon}
                            <span>{label}</span>
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="whitespace-pre-line">{complaint.description}</p>
                  </div>
                  
                  {complaint.response && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-medium mb-1">Réponse :</p>
                      <p className="text-sm whitespace-pre-line">{complaint.response}</p>
                      {complaint.response_date && (
                        <p className="text-xs text-bank-gray mt-2">
                          Répondu le {formatDate(complaint.response_date)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-bank-gray mb-3" />
            <h3 className="text-lg font-medium mb-1">Aucune réclamation</h3>
            <p className="text-bank-gray">Vous n'avez pas encore soumis de réclamation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplaintsList;
