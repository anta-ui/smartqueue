import { useEffect, useState } from "react";
import { notificationService, Notification } from "@/services/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await notificationService.getNotifications();
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = notificationService.subscribe(setNotifications);
    loadNotifications();

    return () => {
      unsubscribe();
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      setError("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      setError("Failed to mark all notifications as read");
    }
  };

  const requestPushPermission = async () => {
    try {
      const permission = await notificationService.requestPushPermission();
      return permission === "granted";
    } catch (err) {
      setError("Failed to request push permission");
      return false;
    }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    requestPushPermission
  };
}
