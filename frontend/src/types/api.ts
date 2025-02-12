export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  prefix: string;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  revokedAt?: string;
  revokedBy?: {
    id: string;
    name: string;
  };
  permissions: string[];
  metadata: {
    description?: string;
    environment?: "development" | "staging" | "production";
    ipRestrictions?: string[];
    rateLimits?: {
      requests: number;
      period: "minute" | "hour" | "day";
    };
  };
  usage: {
    current: {
      requests: number;
      errors: number;
      lastError?: {
        code: string;
        message: string;
        timestamp: string;
      };
    };
    historical: {
      dates: string[];
      requests: number[];
      errors: number[];
    };
  };
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  name: string;
  description: string;
  category: string;
  authentication: "required" | "optional" | "none";
  rateLimit?: {
    requests: number;
    period: "minute" | "hour" | "day";
  };
  parameters?: {
    path?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    query?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    body?: {
      type: string;
      properties: Record<
        string,
        {
          type: string;
          required: boolean;
          description: string;
        }
      >;
    };
  };
  responses: Record<
    string,
    {
      description: string;
      schema?: Record<string, any>;
    }
  >;
}

export interface ApiUsageMetrics {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRequests: number;
    totalErrors: number;
    averageLatency: number;
    p95Latency: number;
    successRate: number;
  };
  byEndpoint: Array<{
    path: string;
    method: string;
    requests: number;
    errors: number;
    averageLatency: number;
  }>;
  byStatus: Record<string, number>;
  byError: Array<{
    code: string;
    count: number;
    message: string;
  }>;
  trends: {
    dates: string[];
    requests: number[];
    errors: number[];
    latency: number[];
  };
}
