export type OrganizationStatus = "active" | "suspended" | "pending" | "archived";
export type PlanType = "free" | "starter" | "professional" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  plan: PlanType;
  billingCycle: BillingCycle;
  createdAt: string;
  updatedAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  billing: {
    email: string;
    vatNumber?: string;
    paymentMethod: {
      type: "card" | "sepa" | "transfer";
      last4?: string;
      expiryDate?: string;
    };
  };
  usage: {
    activeUsers: number;
    totalQueues: number;
    monthlyTickets: number;
    storageUsed: number;
  };
  metrics: {
    mrr: number;
    growth: number;
    churn: number;
    nps: number;
  };
  features: {
    multiLocation: boolean;
    customBranding: boolean;
    api: boolean;
    sla: boolean;
    support: "basic" | "priority" | "dedicated";
  };
  integrations: Array<{
    type: string;
    status: "active" | "inactive";
    config: Record<string, any>;
  }>;
  settings: {
    timezone: string;
    language: string;
    notifications: {
      email: boolean;
      slack: boolean;
      webhook: boolean;
    };
    security: {
      mfa: boolean;
      sso: boolean;
      ipWhitelist: string[];
    };
  };
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    status?: OrganizationStatus[];
    plan?: PlanType[];
    search?: string;
  };
}

export interface OrganizationMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  users: {
    current: number;
    previous: number;
    growth: number;
  };
  tickets: {
    current: number;
    previous: number;
    growth: number;
  };
  satisfaction: {
    current: number;
    previous: number;
    trend: "up" | "down" | "stable";
  };
}

export interface AdvancedFilters {
  status: OrganizationStatus[];
  plan: PlanType[];
  billingCycle: BillingCycle[];
  region: string[];
  minUsers: number | null;
  maxUsers: number | null;
  minRevenue: number | null;
  maxRevenue: number | null;
  createdAfter: string | null;
  createdBefore: string | null;
  hasCustomDomain: boolean | null;
  hasApiEnabled: boolean | null;
}
