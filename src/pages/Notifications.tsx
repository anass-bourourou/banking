
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationService, Notification } from '@/services/NotificationService';
import { Loader2, Bell, Check, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const NotificationsPage = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['allNotifications'],
    queryFn: NotificationService.getNotifications
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      refetch();
      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erreur lors du marquage de la notification');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!notifications) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        toast.info('Toutes les notifications sont déjà lues');
        return;
      }
      
      const promises = unreadNotifications.map(n => NotificationService.markAsRead(n.id));
      await Promise.all(promises);
      
      refetch();
      toast.success(`${unreadNotifications.length} notification(s) marquée(s) comme lue(s)`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Erreur lors du marquage des notifications');
    }
  };
  
  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  }) || [];
  
  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {};
  
  filteredNotifications.forEach(notification => {
    const date = new Date(notification.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Hier';
    } else {
      dateKey = format(date, 'd MMMM yyyy', { locale: fr });
    }
    
    if (!groupedNotifications[dateKey]) {
      groupedNotifications[dateKey] = [];
    }
    
    groupedNotifications[dateKey].push(notification);
  });
  
  // Get notification type icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Notifications</h1>
        <p className="text-bank-gray">Consultez les dernières mises à jour de votre compte</p>
      </div>
      
      <div className="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            onClick={() => setFilter('unread')}
          >
            Non lues
          </Button>
          <Button 
            variant={filter === 'read' ? 'default' : 'outline'} 
            onClick={() => setFilter('read')}
          >
            Lues
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={isLoading || !notifications || notifications.filter(n => !n.read).length === 0}
        >
          <Check className="mr-2 h-4 w-4" />
          Tout marquer comme lu
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex h-60 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-4 h-16 w-16 text-bank-gray-light" />
            <h3 className="text-lg font-medium">Aucune notification</h3>
            <p className="text-bank-gray">
              {filter === 'all' 
                ? "Vous n'avez aucune notification pour le moment" 
                : filter === 'unread' 
                  ? "Vous n'avez aucune notification non lue" 
                  : "Vous n'avez aucune notification lue"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date}>
              <h3 className="mb-3 text-lg font-medium">{date}</h3>
              <div className="space-y-3">
                {dateNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={!notification.read ? 'border-l-4 border-l-blue-500' : ''}
                  >
                    <CardContent className="flex items-start justify-between p-4">
                      <div className="flex space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="mt-1 text-sm text-bank-gray">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-bank-gray">
                            {format(new Date(notification.date), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-auto px-2 py-1"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Marquer comme lu
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default NotificationsPage;
