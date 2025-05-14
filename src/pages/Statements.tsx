
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatementsList } from '@/components/statements/StatementsList';

const Statements = () => {
  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-bold">Relevés bancaires</h1>
      <StatementsList />
    </AppLayout>
  );
};

export default Statements;
