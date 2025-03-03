
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  LineChart, 
  Wallet,
  Clock,
  X
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import notificationService, { 
  Notification, 
  NotificationType 
} from '@/services/notification/notificationService';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Load notifications on mount and when isOpen changes
  useEffect(() => {
    if (isOpen) {
      const allNotifications = notificationService.getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(notificationService.getUnreadNotifications().length);
    }
  }, [isOpen]);
  
  // Set up polling to check for new notifications
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUnreadCount(notificationService.getUnreadNotifications().length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };
  
  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const handleRemoveNotification = (id: string) => {
    notificationService.clearNotification(id);
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    setUnreadCount(notificationService.getUnreadNotifications().length);
  };
  
  // Function to get the icon for a notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'trade_execution':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'security_alert':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'capital_warning':
        return <Wallet className="h-5 w-5 text-amber-500" />;
      case 'portfolio_balance':
        return <LineChart className="h-5 w-5 text-blue-500" />;
      case 'risk_alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'anomaly_detected':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />;
      case 'system_message':
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`relative ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear all
                  </Button>
                </>
              )}
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-6rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <Bell className="h-10 w-10 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`relative rounded-lg border p-4 ${
                    notification.read ? 'bg-card' : 'bg-accent'
                  }`}
                >
                  <div className="absolute top-4 right-4 flex items-center space-x-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleRemoveNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        <Badge
                          variant={
                            notification.priority === 'critical' ? 'destructive' :
                            notification.priority === 'high' ? 'destructive' :
                            notification.priority === 'medium' ? 'secondary' :
                            'outline'
                          }
                          className="ml-2 text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
