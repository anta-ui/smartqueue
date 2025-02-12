"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCache } from "@/hooks/cache/useCache";
import { DashboardConfig, GlobalMetrics, OrganizationLocation } from "@/types/dashboard";
import { DashboardGrid } from "./DashboardGrid";
import { WidgetConfigurator } from "./WidgetConfigurator";
import { useLocalStorage } from "@/hooks/storage/useLocalStorage";

interface MainDashboardProps {
  organizationId?: string;
}

const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  id: "default",
  name: "Tableau de bord principal",
  description: "Vue d'ensemble de l'activité",
  layout: "grid",
  widgets: [
    {
      id: "active-orgs",
      type: "metric",
      title: "Organisations Actives",
      size: "small",
      position: { x: 0, y: 0 },
      settings: {
        dataSource: "/api/metrics/organizations/active",
        refreshInterval: 30000,
      },
    },
    {
      id: "revenue",
      type: "metric",
      title: "Revenu Mensuel (MRR)",
      size: "small",
      position: { x: 1, y: 0 },
      settings: {
        dataSource: "/api/metrics/revenue/mrr",
        refreshInterval: 30000,
      },
    },
    {
      id: "error-rate",
      type: "metric",
      title: "Taux d'Erreur Global",
      size: "small",
      position: { x: 2, y: 0 },
      settings: {
        dataSource: "/api/metrics/errors/rate",
        refreshInterval: 30000,
      },
    },
    {
      id: "system-health",
      type: "status",
      title: "Santé du Système",
      size: "small",
      position: { x: 3, y: 0 },
      settings: {
        dataSource: "/api/system/health",
        refreshInterval: 5000,
      },
    },
    {
      id: "usage-chart",
      type: "chart",
      title: "Utilisation du Service",
      size: "large",
      position: { x: 0, y: 1 },
      settings: {
        dataSource: "/api/metrics/usage",
        refreshInterval: 60000,
        chartType: "area",
        timeRange: "24h",
        metrics: ["requests", "errors", "latency"],
      },
    },
    {
      id: "resources",
      type: "status",
      title: "Ressources Système",
      size: "medium",
      position: { x: 0, y: 2 },
      settings: {
        dataSource: "/api/system/resources",
        refreshInterval: 5000,
      },
    },
    {
      id: "performance",
      type: "map",
      title: "Performance",
      size: "medium",
      position: { x: 1, y: 2 },
      settings: {
        dataSource: "/api/system/performance",
        refreshInterval: 5000,
      },
    },
  ],
  sharing: {
    public: false,
    users: [],
    roles: ["admin"],
  },
};

export function MainDashboard({ organizationId }: MainDashboardProps) {
  const [selectedView, setSelectedView] = useState<"overview" | "custom">("overview");
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  // Charger la configuration du dashboard depuis le stockage local
  const [dashboardConfig, setDashboardConfig] = useLocalStorage<DashboardConfig>(
    `dashboard_config_${organizationId ?? "global"}`,
    DEFAULT_DASHBOARD_CONFIG
  );

  // Charger les métriques globales
  const { data: metrics } = useCache<GlobalMetrics>(
    organizationId
      ? `/api/organizations/${organizationId}/metrics`
      : "/api/admin/metrics",
    {
      refreshInterval: 30000,
    }
  );

  // Charger les emplacements des organisations
  const { data: locations } = useCache<OrganizationLocation[]>(
    organizationId
      ? `/api/organizations/${organizationId}/locations`
      : "/api/admin/organizations/locations",
    {
      refreshInterval: 60000,
    }
  );

  return (
    <div className="space-y-6">
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="custom">Vue personnalisée</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Vue d'ensemble standard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Organisations Actives</p>
                <p className="text-2xl font-bold">
                  {metrics?.organizations.active.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  +{metrics?.organizations.newThisMonth} ce mois
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Revenu Mensuel (MRR)</p>
                <p className="text-2xl font-bold">
                  {metrics?.revenue.mrr.toLocaleString()} €
                </p>
                <p
                  className={`text-xs ${
                    (metrics?.revenue.growth ?? 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {metrics?.revenue.growth >= 0 ? "+" : ""}
                  {metrics?.revenue.growth}% vs mois dernier
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Taux d'Erreur Global</p>
                <p className="text-2xl font-bold">
                  {metrics?.usage.errorRate.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500">
                  Latence P95: {metrics?.usage.p95Latency}ms
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Santé du Système</p>
                <div className="flex items-center space-x-2">
                  {Object.entries(metrics?.system.serviceHealth ?? {}).map(
                    ([service, status]) => (
                      <div
                        key={service}
                        className={`h-3 w-3 rounded-full ${
                          status === "healthy"
                            ? "bg-green-500"
                            : status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        title={`${service}: ${status}`}
                      />
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Uptime: {metrics?.system.uptime.toFixed(2)}%
                </p>
              </div>
            </Card>
          </div>

          {/* Alertes actives */}
          {metrics?.system.alerts.length ? (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-medium text-red-700 mb-2">Alertes Actives</h3>
              <div className="space-y-2">
                {metrics.system.alerts
                  .filter((alert) => !alert.acknowledged)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            alert.severity === "critical"
                              ? "bg-red-500"
                              : alert.severity === "error"
                              ? "bg-orange-500"
                              : alert.severity === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="custom">
          {/* Vue personnalisée avec widgets configurables */}
          <DashboardGrid
            config={dashboardConfig}
            onConfigChange={setDashboardConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de configuration des widgets */}
      <WidgetConfigurator
        isOpen={isConfiguring}
        onClose={() => setIsConfiguring(false)}
        onSave={(widgetConfig) => {
          setDashboardConfig({
            ...dashboardConfig,
            widgets: [...dashboardConfig.widgets, widgetConfig],
          });
          setIsConfiguring(false);
        }}
      />
    </div>
  );
}
