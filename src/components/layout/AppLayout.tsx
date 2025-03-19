
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
  showWelcomeMessage?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showWelcomeMessage = true }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isPageLoaded, setIsPageLoaded] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    // Mark page as loaded after a short delay for smoother transitions
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    // Welcome notification on first load, only if enabled
    if (showWelcomeMessage) {
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
      
      if (!hasShownWelcome) {
        setTimeout(() => {
          toast.success('Bienvenue sur BankWise', {
            description: 'Votre application bancaire personnelle',
            duration: 4000,
          });
          sessionStorage.setItem('hasShownWelcome', 'true');
        }, 1000);
      }
    }

    return () => clearTimeout(timer);
  }, [showWelcomeMessage]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bank-light">
      <div className={sidebarOpen ? "block" : "hidden md:block"}>
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className={`flex-1 overflow-auto p-4 md:p-6 transition-opacity duration-300 ${
          isPageLoaded ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
