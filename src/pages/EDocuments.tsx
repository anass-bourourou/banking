
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { EDocuments as DocumentsList } from '@/components/payments/EDocuments';

const EDocumentsPage = () => {
  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-bold">Documents électroniques</h1>
      <DocumentsList />
    </AppLayout>
  );
};

export default EDocumentsPage;
