"use client";

import { useState } from "react";
import { DashboardConfig, WidgetConfig } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Widget } from "./widgets/Widget";
import { MetricWidget } from "./widgets/MetricWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { ResourceWidget } from "./widgets/ResourceWidget";
import { PerformanceWidget } from "./widgets/PerformanceWidget";
import { PlusIcon } from "@heroicons/react/24/outline";

interface DashboardGridProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
}

export function DashboardGrid({ config, onConfigChange }: DashboardGridProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleAddWidget = () => {
    // Ouvrir le modal de configuration du widget
  };

  const handleEditWidget = (widgetId: string) => {
    // Ouvrir le modal d'édition du widget
  };

  const handleDeleteWidget = (widgetId: string) => {
    onConfigChange({
      ...config,
      widgets: config.widgets.filter((w) => w.id !== widgetId),
    });
  };

  const handleResizeWidget = (widgetId: string, size: WidgetConfig["size"]) => {
    onConfigChange({
      ...config,
      widgets: config.widgets.map((w) =>
        w.id === widgetId ? { ...w, size } : w
      ),
    });
  };

  const renderWidget = (widget: WidgetConfig) => {
    const commonProps = {
      config: widget,
      onEdit: () => handleEditWidget(widget.id),
      onDelete: () => handleDeleteWidget(widget.id),
      onResize: (size: WidgetConfig["size"]) =>
        handleResizeWidget(widget.id, size),
    };

    switch (widget.type) {
      case "metric":
        return <MetricWidget key={widget.id} {...commonProps} />;
      case "chart":
        return <ChartWidget key={widget.id} {...commonProps} />;
      case "status":
        return <ResourceWidget key={widget.id} {...commonProps} />;
      case "map":
        return <PerformanceWidget key={widget.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{config.name}</h2>
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Terminer" : "Personnaliser"}
          </Button>
          {isEditing && (
            <Button onClick={handleAddWidget}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Ajouter un widget
            </Button>
          )}
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          config.layout === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : ""
        }`}
      >
        {config.widgets.map(renderWidget)}
      </div>
    </div>
  );
}
