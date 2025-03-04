
import { format, formatDistanceToNow } from 'date-fns';

export const useRelativeTime = () => {
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    if (date > now) {
      return 'in the future';
    }
    
    const minutesAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (minutesAgo < 60) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (minutesAgo < 24 * 60) {
      return format(date, "'Today at' h:mm a");
    } else if (minutesAgo < 48 * 60) {
      return format(date, "'Yesterday at' h:mm a");
    } else {
      return format(date, 'MMM d, yyyy - h:mm a');
    }
  };
  
  return getRelativeTime;
};
