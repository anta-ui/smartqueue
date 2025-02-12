export type WebhookEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.login"
  | "user.logout"
  | "user.password_reset"
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "billing.invoice.created"
  | "billing.invoice.paid"
  | "billing.invoice.overdue"
  | "billing.subscription.created"
  | "billing.subscription.updated"
  | "billing.subscription.canceled"
  | "api.key.created"
  | "api.key.revoked"
  | "api.rate_limit.exceeded"
  | "api.error.repeated";

export interface WebhookEndpoint {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  description?: string;
  events: WebhookEventType[];
  active: boolean;
  secret: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  metadata: {
    environment?: "development" | "staging" | "production";
    retryPolicy?: {
      maxAttempts: number;
      backoffRate: number;
    };
    timeout?: number;
    headers?: Record<string, string>;
  };
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageLatency: number;
    lastDelivery?: {
      timestamp: string;
      status: "success" | "failure";
      statusCode?: number;
      error?: string;
    };
  };
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: WebhookEventType;
  payload: Record<string, any>;
  timestamp: string;
  status: "pending" | "success" | "failure";
  statusCode?: number;
  error?: string;
  duration: number;
  attempts: Array<{
    timestamp: string;
    status: "success" | "failure";
    statusCode?: number;
    error?: string;
    duration: number;
  }>;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  };
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
}
