
import { useState, useEffect } from 'react';
import notificationService, { 
  Notification, 
  NotificationType,
  NotificationPriority 
} from '@/services/notification/notificationService';

export const useNotifications = (initialNotifications: Notification[] = []) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Initialize and set up regular checks for updates
  useEffect(() => {
    // Load initial notifications
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
    setUnreadCount(notificationService.getUnreadNotifications().length);
    
    // Set up polling interval to check for new notifications
    const intervalId = setInterval(() => {
      const updatedNotifications = notificationService.getNotifications();
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadNotifications().length);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to create a new notification
  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium'
  ) => {
    const notification = notificationService.createNotification(
      type,
      title,
      message,
      priority,
      ['in_app']
    );
    
    setNotifications([notification, ...notifications]);
    setUnreadCount(prev => prev + 1);
    
    return notification;
  };
  
  // Function to mark a notification as read
  const markAsRead = (id: string) => {
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
  
  // Function to mark all notifications as read
  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
  };
  
  // Function to clear a notification
  const clearNotification = (id: string) => {
    notificationService.clearNotification(id);
    
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    setUnreadCount(notificationService.getUnreadNotifications().length);
  };
  
  // Function to clear all notifications
  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Helper functions for specific notification types
  
  // Portfolio update notifications
  const sendPortfolioUpdate = (
    type: 'morning' | 'end_of_day',
    balance: number,
    change: number,
    percentChange: number
  ) => {
    return notificationService.notifyPortfolioBalance(
      type,
      balance,
      change,
      percentChange
    );
  };
  
  // Trade execution notifications
  const sendTradeExecutionNotification = (
    action: 'buy' | 'sell',
    symbol: string,
    quantity: number,
    price: number,
    tradeId: string
  ) => {
    return notificationService.notifyTradeExecution(
      action,
      symbol,
      quantity,
      price,
      tradeId
    );
  };
  
  // Risk alert notifications
  const sendRiskAlert = (
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme',
    message: string,
    details?: any
  ) => {
    return notificationService.notifyRiskAlert(
      riskLevel,
      message,
      details
    );
  };
  
  // Schedule daily notifications
  const scheduleDailyNotifications = (
    morningBalance: number,
    endOfDayBalance: number
  ) => {
    notificationService.scheduleMorningUpdate(morningBalance, 0, 0);
    notificationService.scheduleEndOfDayUpdate(endOfDayBalance, 0, 0);
  };
  
  return {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    sendPortfolioUpdate,
    sendTradeExecutionNotification,
    sendRiskAlert,
    scheduleDailyNotifications
  };
};

export default useNotifications;
