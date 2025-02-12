"use client";

import { useEffect, useState, useMemo } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Widget } from "./Widget";
import { WidgetConfig, RealTimeMetric } from "@/types/dashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartWidgetProps {
  config: WidgetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (size: WidgetConfig["size"]) => void;
}

export function ChartWidget({
  config,
  onEdit,
  onDelete,
  onResize,
}: ChartWidgetProps) {
  const { data: metricsData } = useCache<{
    [key: string]: RealTimeMetric[];
  }>(config.settings.dataSource, {
    refreshInterval: config.settings.refreshInterval ?? 30000,
  });

  const processedData = useMemo(() => {
    if (!metricsData || !config.settings.metrics) return [];

    // Créer un tableau de tous les timestamps uniques
    const allTimestamps = new Set<string>();
    Object.values(metricsData).forEach((metrics) => {
      metrics.forEach((metric) => allTimestamps.add(metric.timestamp));
    });

    // Trier les timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Créer les données formatées pour le graphique
    return sortedTimestamps.map((timestamp) => {
      const dataPoint: any = { timestamp };
      config.settings.metrics?.forEach((metricKey) => {
        const metric = metricsData[metricKey]?.find(
          (m) => m.timestamp === timestamp
        );
        dataPoint[metricKey] = metric?.value ?? null;
      });
      return dataPoint;
    });
  }, [metricsData, config.settings.metrics]);

  const renderChart = () => {
    switch (config.settings.chartType) {
      case "line":
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            <Legend />
            {config.settings.metrics?.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={`hsl(${(index * 360) / config.settings.metrics!.length}, 70%, 50%)`}
                dot={false}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            <Legend />
            {config.settings.metrics?.map((metric, index) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={`hsl(${(index * 360) / config.settings.metrics!.length}, 70%, 50%)`}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            <Legend />
            {config.settings.metrics?.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                fill={`hsl(${(index * 360) / config.settings.metrics!.length}, 70%, 50%)`}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        const latestData = processedData[processedData.length - 1];
        return (
          <PieChart>
            <Pie
              data={config.settings.metrics?.map((metric, index) => ({
                name: metric,
                value: latestData?.[metric] ?? 0,
                fill: `hsl(${(index * 360) / config.settings.metrics!.length}, 70%, 50%)`,
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Widget
      config={config}
      onEdit={onEdit}
      onDelete={onDelete}
      onResize={onResize}
    >
      <div className="h-full w-full p-4">
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
    </Widget>
  );
}
