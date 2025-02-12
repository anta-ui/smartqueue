"use client";

import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Progress } from "@/components/common/Progress";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import type { ServiceHealth } from "@/types/dashboard";

interface ServiceHealthDashboardProps {
  services: ServiceHealth[];
  onRefresh?: () => void;
}

const statusIcons = {
  healthy: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  degraded: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
  down: <XCircleIcon className="h-5 w-5 text-red-500" />,
};

const statusColors = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

export function ServiceHealthDashboard({
  services,
  onRefresh,
}: ServiceHealthDashboardProps) {
  const overallHealth = services.every((s) => s.status === "healthy")
    ? "healthy"
    : services.some((s) => s.status === "down")
    ? "down"
    : "degraded";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Service Health</h2>
          <p className="text-sm text-gray-500">Real-time system status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${
                statusColors[overallHealth]
              }`}
            />
            <span className="text-sm font-medium capitalize">
              {overallHealth}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.service} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {statusIcons[service.status]}
                  <span className="font-medium">{service.service}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Uptime: {service.uptime.toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-2">
                <div>
                  <div className="text-sm text-gray-500">Request Rate</div>
                  <div className="font-medium">
                    {service.metrics.requestRate}/s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Error Rate</div>
                  <div className="font-medium">
                    {service.metrics.errorRate.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Latency</div>
                  <div className="font-medium">
                    {service.metrics.latency}ms
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Saturation</div>
                  <Progress
                    value={service.metrics.saturation}
                    max={100}
                    className="h-2"
                  />
                </div>
              </div>

              {service.incidents.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Recent Incidents</div>
                  <div className="space-y-1">
                    {service.incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              incident.severity === "critical"
                                ? "destructive"
                                : incident.severity === "major"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {incident.severity}
                          </Badge>
                          <span>{incident.description}</span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(incident.startTime).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
