"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricData {
  timestamp: string;
  value: number;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  data: MetricData[];
}

const MOCK_METRICS: Metric[] = [
  {
    id: "cpu",
    name: "Utilisation CPU",
    value: 45,
    unit: "%",
    change: 5,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 30 + Math.random() * 40,
    })),
  },
  {
    id: "memory",
    name: "Mémoire",
    value: 6.2,
    unit: "GB",
    change: -2,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 4 + Math.random() * 4,
    })),
  },
  {
    id: "requests",
    name: "Requêtes/sec",
    value: 250,
    unit: "req/s",
    change: 15,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 150 + Math.random() * 200,
    })),
  },
  {
    id: "errors",
    name: "Taux d'erreur",
    value: 0.5,
    unit: "%",
    change: -0.2,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: Math.random() * 2,
    })),
  },
];

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState("24h");
  const [metrics, setMetrics] = useState<Metric[]>(MOCK_METRICS);
  const [selectedMetric, setSelectedMetric] = useState<string>("cpu");

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 10,
          data: [
            ...metric.data.slice(1),
            {
              timestamp: new Date().toLocaleTimeString(),
              value: metric.value + (Math.random() - 0.5) * 10,
            },
          ],
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* En-tête avec sélecteurs */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Métriques de Performance</h2>
        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="6h">6 heures</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className={`p-4 cursor-pointer transition-shadow hover:shadow-lg ${
              selectedMetric === metric.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{metric.name}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">
                  {metric.value.toFixed(1)}
                  {metric.unit}
                </h3>
                <p
                  className={`text-sm ${
                    metric.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.change >= 0 ? "+" : ""}
                  {metric.change}%
                </p>
              </div>
              <div className="h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.data.slice(-10)}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={
                        selectedMetric === metric.id
                          ? "hsl(var(--primary))"
                          : "#8884d8"
                      }
                      fill={
                        selectedMetric === metric.id
                          ? "hsl(var(--primary)/.2)"
                          : "#8884d820"
                      }
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Graphique détaillé */}
      <Card className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                metrics.find((m) => m.id === selectedMetric)?.data || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alertes de performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Alertes de Performance</h3>
        {/* TODO: Liste des alertes de performance */}
      </Card>
    </div>
  );
}
