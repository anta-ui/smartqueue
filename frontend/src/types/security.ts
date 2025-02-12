export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  severity: "info" | "warning" | "critical";
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "false_positive";
  affectedUsers?: string[];
  affectedResources?: string[];
  resolution?: string;
  assignedTo?: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: "password" | "session" | "access" | "network";
  enabled: boolean;
  config: Record<string, any>;
  lastUpdated: string;
  updatedBy: string;
}

export interface GDPRRequest {
  id: string;
  type: "access" | "deletion" | "correction" | "portability";
  status: "pending" | "processing" | "completed" | "rejected";
  userId: string;
  userEmail: string;
  requestDate: string;
  dueDate: string;
  completionDate?: string;
  assignedTo?: string;
  notes?: string;
  dataCategories: string[];
}

export interface DataProcessingRecord {
  id: string;
  purpose: string;
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: string;
  legalBasis: string;
  crossBorderTransfers?: {
    country: string;
    safeguards: string;
  }[];
  lastReview: string;
  nextReview: string;
  status: "active" | "archived";
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  status: "preparation" | "in_progress" | "obtained" | "expired";
  obtainedDate?: string;
  expiryDate?: string;
  scope: string[];
  requirements: {
    id: string;
    description: string;
    status: "compliant" | "non_compliant" | "partially_compliant";
    evidence?: string;
    notes?: string;
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}
