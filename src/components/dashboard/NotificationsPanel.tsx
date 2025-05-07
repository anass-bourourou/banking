
import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ChevronRight, Clock, Info, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification, NotificationService } from '@/services/NotificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NotificationsPanelProps {
  className?: string;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ className }) => {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: NotificationService.getNotifications,
  });
  
  // Get unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: NotificationService.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications ont été marquées comme lues');
    },
    onError: () => {
      toast.error('Impossible de marquer les notifications comme lues');
    }
  });
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  // Get the appropriate icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className={`rounded-lg bg-white p-4 shadow ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-bank-primary" />
          <h2 className="font-medium">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} {unreadCount === 1 ? 'nouvelle' : 'nouvelles'}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center text-sm text-bank-primary hover:text-bank-primary-dark"
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-sm text-bank-gray">
          Une erreur est survenue lors du chargement des notifications
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-6 text-center text-sm text-bank-gray">
          Vous n'avez pas de notifications
        </div>
      ) : (
        <>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {notifications
                .filter(notification => showAll || !notification.read)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative flex items-start space-x-3 rounded-md p-3 ${
                      notification.type === 'error' ? 'bg-red-50' : notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${!notification.read ? 'mt-0.5' : ''}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(notification.date).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        {notification.message}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      {notification.link ? (
                        <a href={notification.link}>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </a>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-bank-primary hover:text-bank-primary-dark"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Afficher uniquement les non lues' : 'Afficher toutes les notifications'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
