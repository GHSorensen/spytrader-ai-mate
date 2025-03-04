
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import notificationService from '@/services/notification/notificationService';
import { NotificationCenterProps } from './types';
import NotificationList from './NotificationList';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className
}) => {
  const [notifications, setNotifications] = useState(notificationService.getNotifications());
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
      <SheetContent className="sm:max-w-md p-4">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs px-2 h-8"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs px-2 h-8"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <NotificationList 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onRemove={handleRemoveNotification}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
