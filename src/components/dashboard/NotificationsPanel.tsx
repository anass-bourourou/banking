
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CreditCard, AlertTriangle, Info, Clock, X } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataService, Notification } from '@/services/DataService';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: DataService.getNotifications,
    onSuccess: (data) => {
      setNotifications(data);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type'], read: boolean) => {
    if (read) return "bg-gray-50";
    
    switch (type) {
      case 'info':
        return "bg-blue-50";
      case 'warning':
        return "bg-amber-50";
      case 'alert':
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isYesterday(date)) {
      return 'Hier';
    } else {
      return format(date, 'd MMMM yyyy', { locale: fr });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="bg-white py-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="bg-white py-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
          <p className="text-bank-gray">Impossible de charger les notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="bg-white py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-bank-primary">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-bank-gray hover:text-bank-primary"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`relative border-b border-gray-100 p-4 transition-colors last:border-0 hover:bg-gray-50 ${
                  getNotificationColor(notification.type, notification.read)
                } ${!notification.read ? 'font-medium' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-bank-dark">{notification.title}</h4>
                      <span className="text-xs text-bank-gray">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bank-gray-dark">{notification.message}</p>
                  </div>
                  <button
                    className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    onClick={() => clearNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-bank-gray" />
            <p className="text-bank-gray">Aucune notification</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
