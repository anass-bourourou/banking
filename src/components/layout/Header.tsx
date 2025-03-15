
import React from 'react';
import { Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-bank-gray-light bg-white px-4 py-3 md:left-64 md:px-8">
      <div className="flex items-center md:hidden">
        <button 
          className="mr-4 rounded-full p-2 hover:bg-bank-gray-light"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
        <span className="text-lg font-semibold text-bank-primary">BankWise</span>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <button className="relative rounded-full p-2 hover:bg-bank-gray-light">
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 rounded-full p-2 hover:bg-bank-gray-light">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bank-primary text-white">
                <User size={16} />
              </div>
              <span className="hidden font-medium md:block">{user?.name || 'Jean Dupont'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
