export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationChannel = "email" | "in_app" | "slack" | "sms";

export type NotificationCategory =
  | "system"
  | "billing"
  | "security"
  | "usage"
  | "performance"
  | "maintenance"
  | "agent_queue"
  | "agent_ticket"
  | "agent_service_point";

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subject: string;
  content: string;
  variables: string[];
  active: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  organizationId: string;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      channels: NotificationChannel[];
      minPriority: NotificationPriority;
    };
  };
  channels: {
    [key in NotificationChannel]: {
      enabled: boolean;
      config?: Record<string, any>;
    };
  };
  schedules: {
    digest: {
      enabled: boolean;
      frequency: "daily" | "weekly";
      time: string;
      timezone: string;
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
      exceptUrgent: boolean;
    };
  };
}

export interface AgentNotificationMetadata {
  queueId?: string;
  ticketId?: string;
  servicePointId?: string;
  waitingCount?: number;
  estimatedWaitTime?: number;
  customerName?: string;
  priority?: string;
  status?: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  templateId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  content: string;
  metadata: Record<string, any> | AgentNotificationMetadata;
  channels: NotificationChannel[];
  status: {
    read: boolean;
    readAt?: string;
    archived: boolean;
    archivedAt?: string;
  };
  recipient: {
    id: string;
    type: "user" | "organization" | "role";
  };
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  actions?: Array<{
    id: string;
    label: string;
    url?: string;
    type: "link" | "button" | "action";
    style?: "primary" | "secondary" | "danger";
    completed?: boolean;
    completedAt?: string;
  }>;
}
