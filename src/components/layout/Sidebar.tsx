
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { 
  LayoutDashboard, 
  CreditCard, 
  Send, 
  Users, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut,
  FileSpreadsheet
} from 'lucide-react';

// Add the interface to accept the open prop if needed
interface SidebarProps {
  open?: boolean;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu: { label: string; path: string }[]) => {
    return submenu.some(item => location.pathname === item.path);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      path: '/dashboard',
    },
    {
      icon: CreditCard,
      label: 'Comptes',
      path: '/accounts',
    },
    {
      icon: Send,
      label: 'Virements',
      path: '/transfers',
    },
    {
      icon: Users,
      label: 'Bénéficiaires',
      path: '/beneficiaries',
    },
    {
      icon: FileSpreadsheet,
      label: 'Relevés',
      path: '/statements',
    },
    {
      icon: Receipt,
      label: 'Factures',
      submenu: [
        {
          label: 'Paiements',
          path: '/payments',
        },
        {
          label: 'Factures DGI & CIM',
          path: '/moroccan-bills',
        },
        {
          label: 'Reçus',
          path: '/receipts',
        },
      ]
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-bank-gray-light bg-white py-4">
      <div className="px-6">
        <Link to="/dashboard" className="mb-6 flex items-center space-x-2">
          <img src="/logo.svg" alt="Bank Logo" className="h-8" />
          <span className="font-bold">Bank</span>
        </Link>
      </div>
      
      <div className="flex-1 space-y-1 px-2">
        {menuItems.map((item, index) => (
          item.submenu ? (
            <div key={index} className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-start space-x-2 rounded-md font-medium hover:bg-bank-gray-light",
                  isSubmenuActive(item.submenu) ? "bg-bank-gray-light" : "text-bank-dark"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
              <div className="ml-6 space-y-1">
                {item.submenu.map((sub, subIndex) => (
                  <Link key={subIndex} to={sub.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex w-full items-center justify-start space-x-2 rounded-md pl-4 font-medium hover:bg-bank-gray-light",
                        isActive(sub.path) ? "bg-bank-gray-light" : "text-bank-dark"
                      )}
                    >
                      <span>{sub.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link key={index} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-start space-x-2 rounded-md font-medium hover:bg-bank-gray-light",
                  isActive(item.path) ? "bg-bank-gray-light" : "text-bank-dark"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        ))}
      </div>

      <div className="border-t border-bank-gray-light p-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
