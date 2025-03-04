
import { Notification, NotificationType } from '@/services/notification/notificationService';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface NotificationCenterProps {
  className?: string;
}
