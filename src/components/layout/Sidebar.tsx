
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Send, 
  Users, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut, 
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Home, label: 'Tableau de bord', path: '/' },
    { icon: CreditCard, label: 'Comptes', path: '/accounts' },
    { icon: Send, label: 'Virements', path: '/transfers' },
    { icon: Users, label: 'Bénéficiaires', path: '/beneficiaries' },
    { icon: DollarSign, label: 'Paiements', path: '/payments' },
    { icon: FileText, label: 'Relevés', path: '/statements' },
    { icon: Receipt, label: 'Reçus', path: '/receipts' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-10 flex w-64 flex-col bg-white shadow-nav transition-transform duration-300 ease-in-out md:relative md:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full md:w-20 md:translate-x-0'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          {open ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary text-white">
                <DollarSign size={20} />
              </div>
              <span className="text-xl font-bold text-bank-dark">BankWise</span>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary text-white">
              <DollarSign size={20} />
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          <TooltipProvider>
            {menuItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={`group flex items-center rounded-xl p-3 transition-all duration-200 ease-in-out ${
                      isActive(item.path)
                        ? 'bg-bank-primary text-white'
                        : 'text-bank-gray-dark hover:bg-bank-gray-light'
                    }`}
                  >
                    <item.icon size={20} className={`${open ? 'mr-3' : 'mx-auto'}`} />
                    {open && <span className="font-medium">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>

      <div className="border-t border-bank-gray-light p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                to="/settings" 
                className={`flex items-center rounded-xl p-3 transition-all duration-200 ease-in-out ${
                  isActive('/settings') 
                    ? 'bg-bank-primary text-white' 
                    : 'text-bank-gray-dark hover:bg-bank-gray-light'
                }`}
              >
                <Settings size={20} className={`${open ? 'mr-3' : 'mx-auto'}`} />
                {open && <span className="font-medium">Paramètres</span>}
              </Link>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="right">
                Paramètres
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleLogout}
                className={`mt-2 flex w-full items-center rounded-xl p-3 text-bank-gray-dark transition-all duration-200 ease-in-out hover:bg-bank-gray-light`}
              >
                <LogOut size={20} className={`${open ? 'mr-3' : 'mx-auto'}`} />
                {open && <span className="font-medium">Déconnexion</span>}
              </button>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="right">
                Déconnexion
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default Sidebar;
