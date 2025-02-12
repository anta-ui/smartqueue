export type UserRole = "admin" | "manager" | "agent" | "viewer";

export type UserStatus = "active" | "inactive" | "pending" | "blocked";

export interface UserActivity {
  type: "login" | "logout" | "action" | "settings_change";
  timestamp: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
  timezone: string;
  language: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      slack?: boolean;
    };
    theme: "light" | "dark" | "system";
    dashboardLayout?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface UserInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
}
