"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useCache } from "@/hooks/cache/useCache";
import { Widget } from "./Widget";
import { WidgetConfig, RealTimeMetric } from "@/types/dashboard";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

interface MetricWidgetProps {
  config: WidgetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (size: WidgetConfig["size"]) => void;
}

export function MetricWidget({
  config,
  onEdit,
  onDelete,
  onResize,
}: MetricWidgetProps) {
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);

  const { data: metricData } = useCache<RealTimeMetric[]>(
    config.settings.dataSource,
    {
      refreshInterval: config.settings.refreshInterval ?? 30000,
    }
  );

  useEffect(() => {
    if (metricData && metricData.length > 0) {
      const sorted = [...metricData].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setCurrentValue(sorted[0].value);
      setPreviousValue(sorted[1]?.value ?? null);
    }
  }, [metricData]);

  const calculateChange = () => {
    if (currentValue === null || previousValue === null) return null;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const change = calculateChange();

  const renderChangeIndicator = () => {
    if (change === null) return null;

    const Icon =
      change > 0 ? ArrowUpIcon : change < 0 ? ArrowDownIcon : MinusIcon;
    const colorClass =
      change > 0
        ? "text-green-600"
        : change < 0
        ? "text-red-600"
        : "text-gray-600";

    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  };

  return (
    <Widget
      config={config}
      onEdit={onEdit}
      onDelete={onDelete}
      onResize={onResize}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {currentValue !== null ? (
          <>
            <div className="text-4xl font-bold mb-2">
              {formatValue(currentValue)}
            </div>
            {renderChangeIndicator()}
          </>
        ) : (
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        )}
      </div>
    </Widget>
  );
}
