
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotificationIcon } from './utils';
import { NotificationItemProps } from './types';

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove
}) => {
  return (
    <div 
      className={`relative rounded-lg border p-3 ${
        notification.read ? 'bg-card' : 'bg-accent'
      }`}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onRemove(notification.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-1">
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
              className="text-xs"
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
  );
};

export default NotificationItem;
