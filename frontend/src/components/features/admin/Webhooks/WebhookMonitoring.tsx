import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "@/components/features/admin/Metrics/MetricsCard";
import { WebhookAlerts } from "./WebhookAlerts";
import { WebhookRetry } from "./WebhookRetry";
import { WebhookMetricsExport } from "./WebhookMetricsExport";
import { WebhookMetricsComparison } from "./WebhookMetricsComparison";
import { WebhookAlertSettings } from "./WebhookAlertSettings";
import { WebhookIntegrations } from "./WebhookIntegrations";
import { WebhookReportScheduler } from "./WebhookReportScheduler";
import { WebhookCustomDashboard } from "./WebhookCustomDashboard";
import { useCache } from "@/hooks/cache/useCache";
import { formatNumber } from "@/lib/utils/number";
import { WebhookEndpoint } from "@/types/webhook";

interface WebhookMonitoringProps {
  organizationId: string;
  webhookId: string;
}

interface WebhookMetrics {
  totalDeliveries: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
  p95Latency: number;
  p99Latency: number;
  deliveriesByHour: {
    timestamp: string;
    total: number;
    success: number;
    failure: number;
    avgLatency: number;
    p95Latency: number;
  }[];
  deliveriesByEvent: {
    event: string;
    total: number;
    success: number;
    failure: number;
  }[];
  topErrors: {
    error: string;
    count: number;
    percentage: number;
  }[];
  retryStats: {
    totalRetries: number;
    successfulRetries: number;
    averageRetries: number;
  };
}

export function WebhookMonitoring({
  organizationId,
  webhookId,
}: WebhookMonitoringProps) {
  const { data: webhook } = useCache<WebhookEndpoint>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}`
  );

  const { data: metrics, refresh } = useCache<WebhookMetrics>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/metrics`
  );

  if (!webhook || !metrics) {
    return null;
  }

  const handleRetrySuccess = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Monitoring</h2>
          <p className="text-sm text-gray-500">
            Métriques et performances des dernières 24 heures
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <WebhookMetricsExport
            organizationId={organizationId}
            webhookId={webhookId}
          />
          <WebhookAlertSettings
            organizationId={organizationId}
            webhookId={webhookId}
          />
          <WebhookIntegrations
            organizationId={organizationId}
            webhookId={webhookId}
          />
          <WebhookReportScheduler
            organizationId={organizationId}
            webhookId={webhookId}
          />
          <WebhookCustomDashboard
            organizationId={organizationId}
            webhookId={webhookId}
          />
        </div>
      </div>

      <WebhookAlerts
        organizationId={organizationId}
        webhookId={webhookId}
      />

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Taux de Succès"
          value={`${metrics.successRate.toFixed(1)}%`}
          change={metrics.successRate - (webhook.stats.successfulDeliveries / webhook.stats.totalDeliveries) * 100}
          trend={metrics.deliveriesByHour.map((d) => ({
            value: (d.success / d.total) * 100,
            timestamp: d.timestamp,
          }))}
          trendColor={metrics.successRate > 95 ? "green" : metrics.successRate > 90 ? "yellow" : "red"}
        />

        <MetricsCard
          title="Latence Moyenne"
          value={`${metrics.averageLatency.toFixed(0)}ms`}
          change={metrics.averageLatency - webhook.stats.averageLatency}
          changeFormat="ms"
          trend={metrics.deliveriesByHour.map((d) => ({
            value: d.avgLatency,
            timestamp: d.timestamp,
          }))}
          trendColor={metrics.averageLatency < 500 ? "green" : metrics.averageLatency < 1000 ? "yellow" : "red"}
        />

        <MetricsCard
          title="Livraisons (24h)"
          value={formatNumber(metrics.totalDeliveries)}
          change={metrics.totalDeliveries - webhook.stats.totalDeliveries}
          trend={metrics.deliveriesByHour.map((d) => ({
            value: d.total,
            timestamp: d.timestamp,
          }))}
        />

        <MetricsCard
          title="Taux d'Erreur"
          value={`${metrics.errorRate.toFixed(1)}%`}
          change={metrics.errorRate - (webhook.stats.failedDeliveries / webhook.stats.totalDeliveries) * 100}
          trend={metrics.deliveriesByHour.map((d) => ({
            value: (d.failure / d.total) * 100,
            timestamp: d.timestamp,
          }))}
          trendColor={metrics.errorRate < 5 ? "green" : metrics.errorRate < 10 ? "yellow" : "red"}
        />
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="retries">Rejeux</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Performance</CardTitle>
              <CardDescription>
                Distribution des latences et performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Latence P95</h4>
                  <div className="text-2xl font-bold">
                    {metrics.p95Latency.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-500">
                    95% des requêtes sont plus rapides que cette valeur
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Latence P99</h4>
                  <div className="text-2xl font-bold">
                    {metrics.p99Latency.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-500">
                    99% des requêtes sont plus rapides que cette valeur
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution par Événement</CardTitle>
              <CardDescription>
                Répartition des livraisons par type d'événement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.deliveriesByEvent.map((event) => (
                  <div
                    key={event.event}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-gray-500">
                        {event.total} livraisons ({((event.success / event.total) * 100).toFixed(1)}% succès)
                      </p>
                    </div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(event.success / event.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs Fréquentes</CardTitle>
              <CardDescription>
                Les erreurs les plus courantes des dernières 24 heures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topErrors.map((error) => (
                  <div
                    key={error.error}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{error.error}</p>
                      <p className="text-sm text-gray-500">
                        {error.count} occurrences ({error.percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="w-32 h-2 bg-red-100 rounded-full">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${error.percentage}%`,
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de Rejeu</CardTitle>
              <CardDescription>
                Performance des tentatives de rejeu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Total des Rejeux</h4>
                  <div className="text-2xl font-bold">
                    {metrics.retryStats.totalRetries}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Rejeux Réussis</h4>
                  <div className="text-2xl font-bold">
                    {metrics.retryStats.successfulRetries}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Tentatives Moyennes</h4>
                  <div className="text-2xl font-bold">
                    {metrics.retryStats.averageRetries.toFixed(1)}
                  </div>
                </div>
              </div>

              <WebhookRetry
                organizationId={organizationId}
                webhookId={webhookId}
                onSuccess={handleRetrySuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <WebhookMetricsComparison
            organizationId={organizationId}
            webhookId={webhookId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
