import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCache } from "@/hooks/cache/useCache";
import { formatDateTime } from "@/lib/utils/date";

interface WebhookAlert {
  id: string;
  webhookId: string;
  type: "error" | "warning";
  message: string;
  timestamp: string;
  metadata: {
    errorCount?: number;
    errorRate?: number;
    latency?: number;
  };
}

interface WebhookAlertsProps {
  organizationId: string;
  webhookId: string;
  onRetry?: (deliveryIds: string[]) => void;
}

export function WebhookAlerts({
  organizationId,
  webhookId,
  onRetry,
}: WebhookAlertsProps) {
  const { data: alerts, loading, refresh } = useCache<WebhookAlert[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/alerts`
  );

  // Rafraîchir les alertes toutes les minutes
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Notification toast pour les nouvelles alertes
  useEffect(() => {
    if (alerts?.length) {
      const criticalAlerts = alerts.filter(
        (alert) =>
          alert.type === "error" &&
          new Date(alert.timestamp).getTime() > Date.now() - 5 * 60 * 1000 // 5 minutes
      );

      criticalAlerts.forEach((alert) => {
        toast({
          title: "Alerte Webhook Critique",
          description: alert.message,
          variant: "destructive",
        });
      });
    }
  }, [alerts]);

  if (loading || !alerts?.length) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700">Alertes Actives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between border-b border-red-200 pb-4 last:border-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={alert.type === "error" ? "destructive" : "warning"}
                  >
                    {alert.type === "error" ? "Erreur" : "Avertissement"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(alert.timestamp)}
                  </span>
                </div>
                <p className="font-medium text-red-700">{alert.message}</p>
                <div className="text-sm text-gray-600 space-x-4">
                  {alert.metadata.errorCount && (
                    <span>{alert.metadata.errorCount} échecs</span>
                  )}
                  {alert.metadata.errorRate && (
                    <span>Taux d'erreur {alert.metadata.errorRate}%</span>
                  )}
                  {alert.metadata.latency && (
                    <span>Latence {alert.metadata.latency}ms</span>
                  )}
                </div>
              </div>
              {onRetry && alert.metadata.errorCount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry([alert.id])}
                  className="shrink-0"
                >
                  Réessayer les échecs
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
