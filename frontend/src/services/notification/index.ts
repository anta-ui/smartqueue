import { api } from "../api";
import { wsService } from "../socket";

export interface Notification {
  id: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    wsService.subscribe("notification:received", (notification: Notification) => {
      this.addNotification(notification);
    });
  }

  public async loadTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data } = await api.get<NotificationTemplate[]>("/api/notifications/templates");
      data.forEach(template => {
        this.templates.set(template.id, template);
      });
      return data;
    } catch (error) {
      console.error("Failed to load notification templates:", error);
      throw error;
    }
  }

  public async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get<Notification[]>("/api/notifications");
      this.notifications = data;
      return data;
    } catch (error) {
      console.error("Failed to load notifications:", error);
      throw error;
    }
  }

  public async markAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.post<{ success: boolean }>("/api/notifications/mark-read", { id });
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        this.notifyListeners();
      }
      return data;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  public async markAllAsRead(): Promise<{ success: boolean }> {
    try {
      const { data } = await api.post<{ success: boolean }>("/api/notifications/mark-all-read");
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      this.notifyListeners();
      return data;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  private addNotification(notification: Notification) {
    this.notifications = [notification, ...this.notifications];
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  public subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }
}

export const notificationService = new NotificationService();
