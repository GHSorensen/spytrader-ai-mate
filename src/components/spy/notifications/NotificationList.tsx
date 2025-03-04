
import React from 'react';
import { Bell } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from '@/services/notification/notificationService';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onRemove
}) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
        <Bell className="h-10 w-10 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No notifications</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      <div className="space-y-4 pr-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onRemove={onRemove}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;
