
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = 
  'trade_execution' | 
  'security_alert' | 
  'capital_warning' | 
  'portfolio_balance' | 
  'risk_alert' | 
  'anomaly_detected' | 
  'system_message';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationDeliveryMethod = 'in_app' | 'email' | 'push' | 'sms';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  read: boolean;
  deliveryMethods: NotificationDeliveryMethod[];
  relatedData?: any;
}

// In-memory notification storage for demo purposes
let notifications: Notification[] = [];

/**
 * Creates a new notification and dispatches it through the selected delivery methods
 */
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium',
  deliveryMethods: NotificationDeliveryMethod[] = ['in_app'],
  relatedData?: any
): Notification => {
  const notification: Notification = {
    id: uuidv4(),
    type,
    title,
    message,
    timestamp: new Date(),
    priority,
    read: false,
    deliveryMethods,
    relatedData
  };
  
  // Save to notification list
  notifications = [notification, ...notifications];
  
  // Dispatch through each delivery method
  deliveryMethods.forEach(method => {
    dispatchNotification(notification, method);
  });
  
  return notification;
};

/**
 * Dispatches a notification through a specific delivery method
 */
const dispatchNotification = (notification: Notification, method: NotificationDeliveryMethod) => {
  switch (method) {
    case 'in_app':
      showInAppNotification(notification);
      break;
    case 'email':
      sendEmailNotification(notification);
      break;
    case 'push':
      // Not implemented in v1
      console.log('Push notifications not implemented yet', notification);
      break;
    case 'sms':
      // Not implemented in v1
      console.log('SMS notifications not implemented yet', notification);
      break;
  }
};

/**
 * Shows an in-app toast notification
 */
const showInAppNotification = (notification: Notification) => {
  const { title, message, priority } = notification;
  
  switch (priority) {
    case 'critical':
      toast.error(title, {
        description: message,
        duration: 8000,
      });
      break;
    case 'high':
      toast.warning(title, {
        description: message,
        duration: 6000,
      });
      break;
    case 'medium':
      toast.info(title, {
        description: message,
        duration: 5000,
      });
      break;
    case 'low':
      toast(title, {
        description: message,
        duration: 4000,
      });
      break;
  }
};

/**
 * Sends an email notification (mock implementation for v1)
 */
const sendEmailNotification = (notification: Notification) => {
  console.log('Email notification would be sent:', notification);
  // In a real implementation, this would call an API endpoint or edge function
  // to send the actual email
};

/**
 * Gets all notifications
 */
export const getNotifications = (): Notification[] => {
  return [...notifications];
};

/**
 * Gets unread notifications
 */
export const getUnreadNotifications = (): Notification[] => {
  return notifications.filter(n => !n.read);
};

/**
 * Marks a notification as read
 */
export const markAsRead = (id: string): void => {
  notifications = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
};

/**
 * Marks all notifications as read
 */
export const markAllAsRead = (): void => {
  notifications = notifications.map(n => ({ ...n, read: true }));
};

/**
 * Clears a specific notification
 */
export const clearNotification = (id: string): void => {
  notifications = notifications.filter(n => n.id !== id);
};

/**
 * Clears all notifications
 */
export const clearAllNotifications = (): void => {
  notifications = [];
};

/**
 * Creates a trade execution notification
 */
export const notifyTradeExecution = (
  action: 'buy' | 'sell',
  symbol: string,
  quantity: number,
  price: number,
  tradeId: string
) => {
  return createNotification(
    'trade_execution',
    `${action.toUpperCase()}: ${symbol}`,
    `${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol} at $${price.toFixed(2)}`,
    'medium',
    ['in_app', 'email'],
    { tradeId, symbol, quantity, price, action }
  );
};

/**
 * Creates a security alert notification
 */
export const notifySecurityAlert = (
  alertType: 'login_attempt' | 'password_change' | 'unusual_activity',
  details: string
) => {
  return createNotification(
    'security_alert',
    'Security Alert',
    details,
    'high',
    ['in_app', 'email'],
    { alertType }
  );
};

/**
 * Creates a capital warning notification
 */
export const notifyCapitalWarning = (
  currentBalance: number,
  threshold: number
) => {
  return createNotification(
    'capital_warning',
    'Low Capital Warning',
    `Your portfolio balance ($${currentBalance.toFixed(2)}) is approaching the minimum threshold for trading ($${threshold.toFixed(2)})`,
    'high',
    ['in_app', 'email'],
    { currentBalance, threshold }
  );
};

/**
 * Creates a portfolio balance notification (morning or end of day)
 */
export const notifyPortfolioBalance = (
  type: 'morning' | 'end_of_day',
  balance: number,
  change: number,
  percentChange: number
) => {
  const title = type === 'morning' ? 'Morning Portfolio Update' : 'End of Day Summary';
  const changeText = change >= 0 
    ? `+$${change.toFixed(2)} (+${percentChange.toFixed(2)}%)`
    : `-$${Math.abs(change).toFixed(2)} (${percentChange.toFixed(2)}%)`;
  
  return createNotification(
    'portfolio_balance',
    title,
    `Current balance: $${balance.toFixed(2)} | Today's change: ${changeText}`,
    'low',
    ['in_app', 'email'],
    { balance, change, percentChange, type }
  );
};

/**
 * Creates a risk alert notification
 */
export const notifyRiskAlert = (
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme',
  message: string,
  details?: any
) => {
  const priority: NotificationPriority = 
    riskLevel === 'extreme' ? 'critical' :
    riskLevel === 'high' ? 'high' :
    riskLevel === 'moderate' ? 'medium' : 'low';
  
  return createNotification(
    'risk_alert',
    `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk Alert`,
    message,
    priority,
    ['in_app', 'email'],
    details
  );
};

/**
 * Creates an anomaly detection notification
 */
export const notifyAnomalyDetected = (
  anomalyType: string,
  confidence: number,
  description: string,
  anomalyId: string
) => {
  // Determine priority based on confidence
  const priority: NotificationPriority = 
    confidence > 0.8 ? 'high' :
    confidence > 0.6 ? 'medium' : 'low';
  
  return createNotification(
    'anomaly_detected',
    `Anomaly Detected: ${anomalyType}`,
    description,
    priority,
    ['in_app', 'email'],
    { anomalyType, confidence, anomalyId }
  );
};

// Scheduled notification functions

/**
 * Schedule morning portfolio balance notification (9:30 AM EST)
 */
export const scheduleMorningUpdate = (
  balance: number,
  change: number, 
  percentChange: number
) => {
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(), 
    now.getMonth(), 
    now.getDate(), 
    9, // 9 AM
    30 // 30 minutes
  );
  
  // If current time is past 9:30 AM, schedule for next day
  if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() >= 30)) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilExecution = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    notifyPortfolioBalance('morning', balance, change, percentChange);
  }, timeUntilExecution);
  
  return scheduledTime;
};

/**
 * Schedule end of day portfolio balance notification (4:00 PM EST)
 */
export const scheduleEndOfDayUpdate = (
  balance: number,
  change: number, 
  percentChange: number
) => {
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(), 
    now.getMonth(), 
    now.getDate(), 
    16, // 4 PM
    0 // 0 minutes
  );
  
  // If current time is past 4:00 PM, schedule for next day
  if (now.getHours() >= 16) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilExecution = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    notifyPortfolioBalance('end_of_day', balance, change, percentChange);
  }, timeUntilExecution);
  
  return scheduledTime;
};

// Export a default object for the service
export default {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
  notifyTradeExecution,
  notifySecurityAlert,
  notifyCapitalWarning,
  notifyPortfolioBalance,
  notifyRiskAlert,
  notifyAnomalyDetected,
  scheduleMorningUpdate,
  scheduleEndOfDayUpdate
};
