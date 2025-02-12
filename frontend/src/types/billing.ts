export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unit?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: PlanFeature[];
  limits: {
    users: number;
    queues: number;
    storage: number;
    api: {
      rateLimit: number;
      endpoints: string[];
    };
  };
  metadata: {
    popular?: boolean;
    enterprise?: boolean;
    hidden?: boolean;
  };
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  quantity: number;
  billingCycle: "monthly" | "annual";
  paymentMethod: {
    type: "card" | "sepa" | "transfer";
    last4?: string;
    expiryDate?: string;
    brand?: string;
  };
}

export interface Invoice {
  id: string;
  organizationId: string;
  number: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  currency: string;
  amount: number;
  tax: number;
  total: number;
  date: string;
  dueDate: string;
  paidAt?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  metadata: Record<string, any>;
}

export interface FinancialReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    recurring: number;
    oneTime: number;
    refunds: number;
  };
  metrics: {
    mrr: number;
    arr: number;
    arpu: number;
    ltv: number;
    churnRate: number;
    growthRate: number;
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    new: number;
  };
  transactions: Array<{
    date: string;
    type: "charge" | "refund" | "adjustment";
    amount: number;
    status: "succeeded" | "failed" | "pending";
    description: string;
  }>;
  trends: {
    dates: string[];
    revenue: number[];
    subscriptions: number[];
    churn: number[];
  };
}
