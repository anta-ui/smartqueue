"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { useCache } from "@/hooks/cache/useCache";
import { MetricsCard } from "@/components/features/admin/Metrics/MetricsCard";
import { ServiceHealthDashboard } from "@/components/features/admin/Services/ServiceHealthDashboard";
import {
  UsersIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ServerIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { GlobalMetrics, ServiceHealth } from "@/types/dashboard";

// Import dynamique de la carte pour éviter les problèmes de SSR
const OrganizationsMap = dynamic(
  () => import("@/components/features/admin/Map/OrganizationsMap").then(
    (mod) => mod.OrganizationsMap
  ),
  { ssr: false }
);

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  
  const { data: metrics, loading, refresh } = useCache<GlobalMetrics>({
    key: `dashboard_metrics_${timeRange}`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/dashboard/metrics?range=${timeRange}`);
      return response.json();
    },
  });

  const { data: services } = useCache<ServiceHealth[]>({
    key: "system_services",
    fetchData: async () => {
      const response = await fetch("/api/admin/system/services");
      return response.json();
    },
    maxAge: 60 * 1000, // 1 minute
  });

  const handleRefresh = () => {
    refresh();
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-32"
          >
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </Select>
          <Button onClick={handleRefresh}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Organisations Actives"
          value={metrics?.organizations.active.toLocaleString()}
          change={metrics?.organizations.churnRate}
          trend={metrics?.organizations.trends || []}
          labels={metrics?.trends.dates || []}
          icon={<UsersIcon className="h-5 w-5" />}
          color="rgb(99, 102, 241)"
        />

        <MetricsCard
          title="Revenu Mensuel (MRR)"
          value={new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
          }).format(metrics?.revenue.mrr || 0)}
          change={metrics?.revenue.growth}
          trend={metrics?.revenue.trends || []}
          labels={metrics?.trends.dates || []}
          icon={<CurrencyEuroIcon className="h-5 w-5" />}
          color="rgb(34, 197, 94)"
          format={(v) =>
            new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(v)
          }
        />

        <MetricsCard
          title="Requêtes / Minute"
          value={metrics?.usage.totalRequests.toLocaleString()}
          change={
            ((metrics?.usage.totalRequests || 0) -
              (metrics?.usage.previousRequests || 0)) /
            (metrics?.usage.previousRequests || 1) *
            100
          }
          trend={metrics?.usage.trends || []}
          labels={metrics?.trends.dates || []}
          icon={<ChartBarIcon className="h-5 w-5" />}
          color="rgb(234, 179, 8)"
        />

        <MetricsCard
          title="Santé Système"
          value={`${metrics?.system.uptime.toFixed(2)}%`}
          change={0}
          trend={metrics?.system.trends || []}
          labels={metrics?.trends.dates || []}
          icon={<ServerIcon className="h-5 w-5" />}
          color="rgb(59, 130, 246)"
        />
      </div>

      {/* Carte et État des Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Distribution Géographique</h2>
              <div className="text-sm text-gray-500">
                {metrics?.organizations.total.toLocaleString()} organisations dans{" "}
                {metrics?.organizations.countries} pays
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <OrganizationsMap
                organizations={metrics?.organizations.locations || []}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <ServiceHealthDashboard
            services={services || []}
            onRefresh={handleRefresh}
          />
        </Card>
      </div>

      {/* Alertes Système */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Alertes Système</h2>
            <Badge variant={metrics?.system.alerts.length ? "warning" : "success"}>
              {metrics?.system.alerts.length || 0} active
              {metrics?.system.alerts.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.system.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                          ? "warning"
                          : "secondary"
                      }>
                        {alert.severity}
                      </Badge>
                      <h3 className="font-medium">{alert.message}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Gérer l'acquittement de l'alerte
                      }}
                    >
                      Acquitter
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!metrics?.system.alerts.length && (
              <div className="text-center text-gray-500 py-4">
                Aucune alerte active
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
