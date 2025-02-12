export type AuditEventType =
  | "user.login"
  | "user.logout"
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.blocked"
  | "user.unblocked"
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "organization.suspended"
  | "organization.activated"
  | "billing.subscription.created"
  | "billing.subscription.updated"
  | "billing.subscription.canceled"
  | "billing.invoice.created"
  | "billing.invoice.paid"
  | "billing.invoice.voided"
  | "billing.payment.succeeded"
  | "billing.payment.failed"
  | "api.key.created"
  | "api.key.revoked"
  | "settings.updated"
  | "security.mfa.enabled"
  | "security.mfa.disabled"
  | "security.password.changed"
  | "security.password.reset"
  | "security.access.granted"
  | "security.access.revoked";

export type AuditEventSeverity = "info" | "warning" | "error";

export interface AuditEvent {
  id: string;
  organizationId: string;
  type: AuditEventType;
  severity: AuditEventSeverity;
  actor: {
    id: string;
    type: "user" | "system" | "api";
    name: string;
  };
  target?: {
    id: string;
    type: string;
    name: string;
  };
  metadata: Record<string, any>;
  ip?: string;
  userAgent?: string;
  location?: {
    city?: string;
    country?: string;
    continent?: string;
  };
  timestamp: string;
}
