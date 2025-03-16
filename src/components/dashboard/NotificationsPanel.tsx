
import React from 'react';
import { Bell, CreditCard, AlertTriangle, Info } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NotificationType = 'info' | 'warning' | 'alert';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
}

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Paiement à venir',
      message: 'Votre prélèvement automatique EDF de 82,50 € est prévu pour demain',
      type: 'info',
      date: '2023-09-22',
      read: false,
    },
    {
      id: '2',
      title: 'Solde faible',
      message: 'Votre compte Épargne atteindra bientôt le seuil minimum',
      type: 'warning',
      date: '2023-09-21',
      read: false,
    },
    {
      id: '3',
      title: 'Nouvelle carte bancaire',
      message: 'Votre nouvelle carte sera livrée dans les 5 jours ouvrables',
      type: 'info',
      date: '2023-09-20',
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getNotificationIcon = (type: NotificationType) => {
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

  const getNotificationColor = (type: NotificationType, read: boolean) => {
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`border-b border-gray-100 p-4 transition-colors last:border-0 hover:bg-gray-50 ${
                  getNotificationColor(notification.type, notification.read)
                } ${!notification.read ? 'font-medium' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-bank-dark">{notification.title}</h4>
                      <span className="text-xs text-bank-gray">
                        {new Date(notification.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bank-gray-dark">{notification.message}</p>
                  </div>
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
