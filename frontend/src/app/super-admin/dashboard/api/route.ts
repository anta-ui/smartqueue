// src/app/api/super-admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import {
  GlobalMetrics,
  OrganizationLocation,
  UsageTrend,
  ServiceHealth,
  SystemAlert,
  SystemLog
} from '@/types/dashboard';

// Données mockées pour le développement
const mockData = {
  globalMetrics: {
    organizations: {
      total: 150,
      active: 120,
      newThisMonth: 10,
      churnRate: 2.5
    },
    revenue: {
      mrr: 50000,
      arr: 600000,
      growth: 15,
      averageRevenue: 3500
    },
    usage: {
      totalRequests: 1500000,
      errorRate: 0.5,
      averageLatency: 250,
      p95Latency: 500
    },
    system: {
      uptime: 99.99,
      serviceHealth: {
        api: "healthy",
        websocket: "healthy",
        database: "healthy",
        cache: "healthy"
      },
      alerts: []
    }
  },
  locations: [
    {
      id: "1",
      name: "Paris",
      latitude: 48.8566,
      longitude: 2.3522,
      activeUsers: 50,
      status: "active"
    }
  ],
  usageTrends: [
    {
      timestamp: new Date().toISOString(),
      metrics: {
        requests: 1000,
        errors: 5,
        latency: 200,
        activeUsers: 80
      }
    }
  ],
  serviceHealth: [
    {
      service: "API",
      status: "healthy",
      uptime: 99.99,
      incidents: [],
      metrics: {
        requestRate: 100,
        errorRate: 0.5,
        latency: 200,
        saturation: 30
      }
    }
  ],
  systemAlerts: [
    {
      id: "1",
      message: "Performance optimale",
      severity: "info",
      timestamp: new Date().toISOString(),
      type: "performance"
    }
  ],
  recentLogs: [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      level: "info",
      service: "API",
      message: "Système fonctionnel"
    }
  ]
};

export async function GET() {
  try {
    return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}