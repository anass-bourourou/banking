
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CreditCard } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';

// Define card interface
interface BankCard {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  type: 'visa' | 'mastercard' | 'others';
  status: 'active' | 'blocked' | 'expired';
  cvv: string;
}

const CardDisplay: React.FC = () => {
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  // Fetch cards from API
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['bank-cards'],
    queryFn: async (): Promise<BankCard[]> => {
      try {
        const response = await fetchWithAuth('/cards');
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching cards:', error);
        return [];
      }
    }
  });
  
  // Mask card number except last 4 digits
  const formatCardNumber = (number: string, revealed: boolean) => {
    if (revealed) {
      // Format as 4 groups of 4 digits
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else {
      // Mask all but last 4 digits
      return '•••• •••• •••• ' + number.slice(-4);
    }
  };
  
  // Toggle visibility of card details
  const toggleCardDetails = () => {
    setShowCardDetails(!showCardDetails);
  };
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-bank-primary"></div>
        </div>
      ) : cards.length > 0 ? (
        cards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <div className="bg-gradient-to-r from-bank-primary to-bank-primary-dark p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">Carte bancaire</p>
                  <p className="mt-1 font-medium">{card.type === 'visa' ? 'VISA' : card.type === 'mastercard' ? 'MasterCard' : 'Carte'}</p>
                </div>
                <CreditCard className="h-8 w-8 opacity-80" />
              </div>
              
              <div className="mt-6">
                <p className="font-mono text-lg tracking-wider">
                  {formatCardNumber(card.number, showCardDetails)}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">Titulaire</p>
                  <p className="font-medium">{card.holder}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Expire</p>
                  <p className="font-medium">{card.expiry}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">CVV</p>
                  <p className="font-medium">{showCardDetails ? card.cvv : '•••'}</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                    card.status === 'active' ? 'bg-green-100 text-green-800' : 
                    card.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {card.status === 'active' ? 'Active' : 
                     card.status === 'blocked' ? 'Bloquée' : 'Expirée'}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleCardDetails}
                >
                  {showCardDetails ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Masquer les détails
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Afficher les détails
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucune carte disponible</CardTitle>
            <CardDescription>Vous n'avez pas encore de carte bancaire associée à votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Demander une carte</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CardDisplay;
