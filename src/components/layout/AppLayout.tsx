
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from '@/components/ui/sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    // Welcome notification on first load
    setTimeout(() => {
      toast.success('Bienvenue sur BankWise', {
        description: 'Votre application bancaire personnelle',
      });
    }, 1000);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bank-light">
      <Sidebar open={sidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
