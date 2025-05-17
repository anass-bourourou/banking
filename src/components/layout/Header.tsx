
import React, { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationService, Notification } from '@/services/NotificationService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openNotifications, setOpenNotifications] = useState(false);

  const { data: notifications, isLoading: isLoadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['headerNotifications'],
    queryFn: NotificationService.getNotifications,
    refetchInterval: 60000,
  });

  const unreadCount = notifications?.filter(notification => !notification.read).length || 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications) return;
    
    try {
      const promises = notifications
        .filter(notification => !notification.read)
        .map(notification => NotificationService.markAsRead(notification.id));
      
      await Promise.all(promises);
      refetchNotifications();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
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
        <span className="text-lg font-semibold text-bank-primary">CIH Bank</span>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <Popover open={openNotifications} onOpenChange={setOpenNotifications}>
          <PopoverTrigger asChild>
            <button className="relative rounded-full p-2 hover:bg-bank-gray-light">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="h-auto px-2 py-1 text-xs"
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
            <ScrollArea className="h-80">
              {isLoadingNotifications ? (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-sm text-bank-gray">Chargement...</span>
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div>
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border-b p-3 transition-colors hover:bg-bank-gray-light/50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-bank-gray">
                          {formatNotificationDate(notification.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{notification.message}</p>
                      {!notification.read && (
                        <Badge className="mt-2" variant="outline">Nouveau</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-sm text-bank-gray">Aucune notification</span>
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-2 text-center">
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs"
                onClick={() => {
                  setOpenNotifications(false);
                  navigate('/notifications');
                }}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 rounded-full p-2 hover:bg-bank-gray-light">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bank-primary text-white">
                <User size={16} />
              </div>
              <span className="hidden font-medium md:block">{user?.name || 'Anass Bourourou'}</span>
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
