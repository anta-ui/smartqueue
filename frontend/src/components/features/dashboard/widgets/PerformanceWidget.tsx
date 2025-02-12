"use client";

import { useEffect, useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Widget } from "./Widget";
import { WidgetConfig, PerformanceMetrics } from "@/types/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PerformanceWidgetProps {
  config: WidgetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (size: WidgetConfig["size"]) => void;
}

export function PerformanceWidget({
  config,
  onEdit,
  onDelete,
  onResize,
}: PerformanceWidgetProps) {
  const { data: performance } = useCache<PerformanceMetrics>(
    config.settings.dataSource,
    {
      refreshInterval: config.settings.refreshInterval ?? 5000,
    }
  );

  const getApdexColor = (score: number) => {
    if (score >= 0.94) return "text-green-500";
    if (score >= 0.85) return "text-yellow-500";
    return "text-red-500";
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Widget
      config={config}
      onEdit={onEdit}
      onDelete={onDelete}
      onResize={onResize}
    >
      <div className="p-4 space-y-6">
        {/* Apdex Score */}
        <div className="text-center">
          <div className="text-sm font-medium mb-2">Apdex Score</div>
          <div
            className={`text-4xl font-bold ${getApdexColor(
              performance?.apdex ?? 0
            )}`}
          >
            {performance?.apdex.toFixed(2)}
          </div>
        </div>

        {/* Response Time Distribution */}
        <div>
          <div className="text-sm font-medium mb-4">Response Time</div>
          <div className="space-y-2">
            {Object.entries(performance?.responseTime ?? {}).map(
              ([percentile, value]) => (
                <div key={percentile} className="flex justify-between">
                  <span className="text-sm">p{percentile.slice(1)}</span>
                  <span className="text-sm text-gray-500">
                    {formatDuration(value)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Throughput */}
        <div>
          <div className="text-sm font-medium mb-2">Throughput</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {performance?.throughput.current.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {performance?.throughput.peak.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {performance?.throughput.average.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
          </div>
        </div>

        {/* Error Rates */}
        <div>
          <div className="text-sm font-medium mb-2">Errors</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Rate</span>
              <span
                className={`text-sm ${
                  (performance?.errors.rate ?? 0) > 1
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {performance?.errors.rate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Count</span>
              <span className="text-sm text-gray-500">
                {performance?.errors.count.toLocaleString()}
              </span>
            </div>
          </div>
          {performance?.errors.types && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Top Error Types</div>
              {Object.entries(performance.errors.types)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="truncate">{type}</span>
                    <span>{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Resource Saturation */}
        <div>
          <div className="text-sm font-medium mb-2">Resource Saturation</div>
          <div className="space-y-1">
            {Object.entries(performance?.saturation ?? {}).map(
              ([resource, value]) => (
                <div key={resource} className="flex justify-between">
                  <span className="text-sm capitalize">{resource}</span>
                  <span
                    className={`text-sm ${
                      value > 80
                        ? "text-red-500"
                        : value > 60
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {value.toFixed(1)}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Widget>
  );
}
