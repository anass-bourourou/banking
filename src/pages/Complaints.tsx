
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ComplaintForm from '@/components/complaints/ComplaintForm';
import ComplaintsList from '@/components/complaints/ComplaintsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { ComplaintService } from '@/services/ComplaintService';

const Complaints = () => {
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: ComplaintService.getComplaints,
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Réclamations</h1>
        <p className="text-bank-gray">Gérez vos réclamations et suivez leur traitement</p>
      </div>
      
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nouvelle réclamation</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <ComplaintForm />
        </TabsContent>
        
        <TabsContent value="history">
          <ComplaintsList complaints={complaints} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Complaints;
