export interface OrganizationLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "inactive" | "suspended";
  metrics: {
    users: number;
    requests: number;
    errorRate: number;
    uptime: number;
  };
}

export interface GlobalMetrics {
  organizations: {
    total: number;
    active: number;
    newThisMonth: number;
    churnRate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    averageRevenue: number;
  };
  usage: {
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
    p95Latency: number;
  };
  system: {
    uptime: number;
    serviceHealth: {
      api: "healthy" | "degraded" | "down";
      websocket: "healthy" | "degraded" | "down";
      database: "healthy" | "degraded" | "down";
      cache: "healthy" | "degraded" | "down";
    };
    alerts: Array<{
      id: string;
      severity: "info" | "warning" | "error" | "critical";
      message: string;
      timestamp: string;
      acknowledged: boolean;
    }>;
  };
}

export interface UsageTrend {
  timestamp: string;
  metrics: {
    requests: number;
    errors: number;
    latency: number;
    activeUsers: number;
  };
}

export interface RegionalMetrics {
  region: string;
  organizations: number;
  revenue: number;
  usage: number;
  growth: number;
}

export interface ServiceHealth {
  service: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  incidents: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    description: string;
    severity: "minor" | "major" | "critical";
    status: "investigating" | "identified" | "monitoring" | "resolved";
  }>;
  metrics: {
    requestRate: number;
    errorRate: number;
    latency: number;
    saturation: number;
  };
}

export interface WidgetConfig {
  id: string;
  type: "metric" | "chart" | "table" | "map" | "status";
  title: string;
  size: "small" | "medium" | "large";
  position: {
    x: number;
    y: number;
  };
  settings: {
    dataSource: string;
    refreshInterval?: number;
    chartType?: "line" | "bar" | "pie" | "area";
    timeRange?: "1h" | "24h" | "7d" | "30d";
    metrics?: string[];
    filters?: Record<string, any>;
  };
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  layout: "grid" | "fluid";
  widgets: WidgetConfig[];
  sharing: {
    public: boolean;
    users: string[];
    roles: string[];
  };
}

export interface RealTimeMetric {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface RealTimeData {
  metrics: {
    [key: string]: RealTimeMetric[];
  };
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    data: Record<string, any>;
  }>;
}

export interface ResourceUtilization {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    readWrite: {
      reads: number;
      writes: number;
      latency: number;
    };
  };
  network: {
    incoming: number;
    outgoing: number;
    connections: number;
    latency: number;
  };
}

export interface PerformanceMetrics {
  apdex: number;
  responseTime: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    current: number;
    peak: number;
    average: number;
  };
  errors: {
    rate: number;
    count: number;
    types: Record<string, number>;
  };
  saturation: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}
