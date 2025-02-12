"use client";

import { useEffect, useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Widget } from "./Widget";
import { WidgetConfig, ResourceUtilization } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface ResourceWidgetProps {
  config: WidgetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (size: WidgetConfig["size"]) => void;
}

export function ResourceWidget({
  config,
  onEdit,
  onDelete,
  onResize,
}: ResourceWidgetProps) {
  const { data: resources } = useCache<ResourceUtilization>(
    config.settings.dataSource,
    {
      refreshInterval: config.settings.refreshInterval ?? 5000,
    }
  );

  const formatBytes = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const getProgressColor = (usage: number) => {
    if (usage >= 90) return "bg-red-500";
    if (usage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Widget
      config={config}
      onEdit={onEdit}
      onDelete={onDelete}
      onResize={onResize}
    >
      <div className="p-4 space-y-6">
        {/* CPU */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">CPU</span>
            <span className="text-sm text-gray-500">
              {resources?.cpu.usage.toFixed(1)}% ({resources?.cpu.cores} cores)
            </span>
          </div>
          <Progress
            value={resources?.cpu.usage ?? 0}
            className={getProgressColor(resources?.cpu.usage ?? 0)}
          />
          <div className="mt-1 text-xs text-gray-500">
            Load: {resources?.cpu.load.map((l) => l.toFixed(2)).join(" ")}
          </div>
        </div>

        {/* Memory */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Memory</span>
            <span className="text-sm text-gray-500">
              {formatBytes(resources?.memory.used ?? 0)} /{" "}
              {formatBytes(resources?.memory.total ?? 0)}
            </span>
          </div>
          <Progress
            value={
              ((resources?.memory.used ?? 0) / (resources?.memory.total ?? 1)) *
              100
            }
            className={getProgressColor(
              ((resources?.memory.used ?? 0) / (resources?.memory.total ?? 1)) *
                100
            )}
          />
          <div className="mt-1 text-xs text-gray-500">
            Cached: {formatBytes(resources?.memory.cached ?? 0)}
          </div>
        </div>

        {/* Disk */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Disk</span>
            <span className="text-sm text-gray-500">
              {formatBytes(resources?.disk.used ?? 0)} /{" "}
              {formatBytes(resources?.disk.total ?? 0)}
            </span>
          </div>
          <Progress
            value={
              ((resources?.disk.used ?? 0) / (resources?.disk.total ?? 1)) * 100
            }
            className={getProgressColor(
              ((resources?.disk.used ?? 0) / (resources?.disk.total ?? 1)) * 100
            )}
          />
          <div className="mt-1 text-xs text-gray-500">
            I/O: {resources?.disk.readWrite.reads.toFixed(1)} reads/s,{" "}
            {resources?.disk.readWrite.writes.toFixed(1)} writes/s
          </div>
        </div>

        {/* Network */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Network</span>
            <span className="text-sm text-gray-500">
              {resources?.network.connections} connections
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>In: {formatBytes(resources?.network.incoming ?? 0)}/s</span>
              <span>Out: {formatBytes(resources?.network.outgoing ?? 0)}/s</span>
            </div>
            <div className="text-xs text-gray-500">
              Latency: {resources?.network.latency.toFixed(2)}ms
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
}
