import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useCache } from "@/hooks/cache/useCache";
import { formatDateTime } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";

interface WebhookMetricsComparisonProps {
  organizationId: string;
  webhookId: string;
}

interface ComparisonMetrics {
  period1: {
    from: string;
    to: string;
    metrics: {
      totalDeliveries: number;
      successRate: number;
      errorRate: number;
      averageLatency: number;
      p95Latency: number;
      topErrors: Array<{
        error: string;
        count: number;
        percentage: number;
      }>;
    };
  };
  period2: {
    from: string;
    to: string;
    metrics: {
      totalDeliveries: number;
      successRate: number;
      errorRate: number;
      averageLatency: number;
      p95Latency: number;
      topErrors: Array<{
        error: string;
        count: number;
        percentage: number;
      }>;
    };
  };
}

const PRESET_PERIODS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function WebhookMetricsComparison({
  organizationId,
  webhookId,
}: WebhookMetricsComparisonProps) {
  const [period1, setPeriod1] = useState({
    from: new Date(Date.now() - PRESET_PERIODS["24h"]),
    to: new Date(),
  });
  const [period2, setPeriod2] = useState({
    from: new Date(Date.now() - 2 * PRESET_PERIODS["24h"]),
    to: new Date(Date.now() - PRESET_PERIODS["24h"]),
  });

  const { data: comparison } = useCache<ComparisonMetrics>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/metrics/compare`,
    {
      params: {
        period1From: period1.from.toISOString(),
        period1To: period1.to.toISOString(),
        period2From: period2.from.toISOString(),
        period2To: period2.to.toISOString(),
      },
    }
  );

  const handlePresetChange = (preset: keyof typeof PRESET_PERIODS) => {
    const now = new Date();
    const period = PRESET_PERIODS[preset];
    setPeriod1({
      from: new Date(now.getTime() - period),
      to: now,
    });
    setPeriod2({
      from: new Date(now.getTime() - 2 * period),
      to: new Date(now.getTime() - period),
    });
  };

  const getChangeIndicator = (value1: number, value2: number) => {
    const change = ((value1 - value2) / value2) * 100;
    const color = change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600";
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    return (
      <span className={color}>
        {arrow} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  if (!comparison) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select
          onValueChange={(value) =>
            handlePresetChange(value as keyof typeof PRESET_PERIODS)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Dernières 24h vs précédentes</SelectItem>
            <SelectItem value="7d">7 derniers jours vs précédents</SelectItem>
            <SelectItem value="30d">30 derniers jours vs précédents</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>ou sélectionner des dates personnalisées</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium mb-2">Période 1</h3>
          <div className="flex gap-4">
            <Calendar
              mode="single"
              selected={period1.from}
              onSelect={(date) =>
                date && setPeriod1((prev) => ({ ...prev, from: date }))
              }
              disabled={(date) =>
                date > new Date() || date > period1.to
              }
            />
            <Calendar
              mode="single"
              selected={period1.to}
              onSelect={(date) =>
                date && setPeriod1((prev) => ({ ...prev, to: date }))
              }
              disabled={(date) =>
                date > new Date() || date < period1.from
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Période 2</h3>
          <div className="flex gap-4">
            <Calendar
              mode="single"
              selected={period2.from}
              onSelect={(date) =>
                date && setPeriod2((prev) => ({ ...prev, from: date }))
              }
              disabled={(date) =>
                date > period1.from || date > period2.to
              }
            />
            <Calendar
              mode="single"
              selected={period2.to}
              onSelect={(date) =>
                date && setPeriod2((prev) => ({ ...prev, to: date }))
              }
              disabled={(date) =>
                date > period1.from || date < period2.from
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métriques Clés</CardTitle>
            <CardDescription>
              Comparaison des indicateurs principaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">Métrique</div>
                <div className="text-sm font-medium">
                  {formatDateTime(period1.from)} - {formatDateTime(period1.to)}
                </div>
                <div className="text-sm font-medium">
                  {formatDateTime(period2.from)} - {formatDateTime(period2.to)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="text-sm">Livraisons</div>
                  <div className="text-sm font-medium">
                    {formatNumber(comparison.period1.metrics.totalDeliveries)}
                  </div>
                  <div className="text-sm">
                    {formatNumber(comparison.period2.metrics.totalDeliveries)}{" "}
                    {getChangeIndicator(
                      comparison.period1.metrics.totalDeliveries,
                      comparison.period2.metrics.totalDeliveries
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="text-sm">Taux de Succès</div>
                  <div className="text-sm font-medium">
                    {comparison.period1.metrics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm">
                    {comparison.period2.metrics.successRate.toFixed(1)}%{" "}
                    {getChangeIndicator(
                      comparison.period1.metrics.successRate,
                      comparison.period2.metrics.successRate
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="text-sm">Latence Moyenne</div>
                  <div className="text-sm font-medium">
                    {comparison.period1.metrics.averageLatency.toFixed(0)}ms
                  </div>
                  <div className="text-sm">
                    {comparison.period2.metrics.averageLatency.toFixed(0)}ms{" "}
                    {getChangeIndicator(
                      -comparison.period1.metrics.averageLatency,
                      -comparison.period2.metrics.averageLatency
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="text-sm">Latence P95</div>
                  <div className="text-sm font-medium">
                    {comparison.period1.metrics.p95Latency.toFixed(0)}ms
                  </div>
                  <div className="text-sm">
                    {comparison.period2.metrics.p95Latency.toFixed(0)}ms{" "}
                    {getChangeIndicator(
                      -comparison.period1.metrics.p95Latency,
                      -comparison.period2.metrics.p95Latency
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Erreurs Principales</CardTitle>
            <CardDescription>
              Comparaison des erreurs les plus fréquentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Période 1</h4>
                  <div className="space-y-2">
                    {comparison.period1.metrics.topErrors.map((error) => (
                      <div
                        key={error.error}
                        className="text-sm flex justify-between"
                      >
                        <span>{error.error}</span>
                        <span>
                          {error.count} ({error.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Période 2</h4>
                  <div className="space-y-2">
                    {comparison.period2.metrics.topErrors.map((error) => (
                      <div
                        key={error.error}
                        className="text-sm flex justify-between"
                      >
                        <span>{error.error}</span>
                        <span>
                          {error.count} ({error.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
