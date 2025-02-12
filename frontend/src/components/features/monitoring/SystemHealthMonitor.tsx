"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ServerIcon,
  CloudIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastIncident?: string;
  icon: any;
}

const MOCK_SERVICES: ServiceStatus[] = [
  {
    id: "api",
    name: "API REST",
    status: "operational",
    latency: 45,
    uptime: 99.99,
    icon: ServerIcon,
  },
  {
    id: "websocket",
    name: "WebSocket",
    status: "operational",
    latency: 12,
    uptime: 99.95,
    icon: BoltIcon,
  },
  {
    id: "database",
    name: "Base de données",
    status: "degraded",
    latency: 150,
    uptime: 99.5,
    lastIncident: "Latence élevée",
    icon: ServerIcon,
  },
  {
    id: "storage",
    name: "Stockage",
    status: "operational",
    latency: 85,
    uptime: 99.99,
    icon: CloudIcon,
  },
];

const StatusIcon = ({ status }: { status: ServiceStatus["status"] }) => {
  switch (status) {
    case "operational":
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case "degraded":
      return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
    case "down":
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
  }
};

export default function SystemHealthMonitor() {
  const [services, setServices] = useState<ServiceStatus[]>(MOCK_SERVICES);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          latency: Math.floor(Math.random() * 200),
        }))
      );
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold">État du Système</h2>
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      {/* Vue d'ensemble */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <TooltipProvider key={service.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <service.icon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">{service.name}</h3>
                      </div>
                      <StatusIcon status={service.status} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Latence</span>
                        <span
                          className={
                            service.latency > 100
                              ? "text-yellow-500"
                              : "text-green-500"
                          }
                        >
                          {service.latency}ms
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span>{service.uptime}%</span>
                      </div>
                    </div>

                    {service.lastIncident && (
                      <p className="text-sm text-yellow-500">
                        ⚠️ {service.lastIncident}
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm">
                      Status: {service.status}
                      <br />
                      Latence: {service.latency}ms
                      <br />
                      Uptime: {service.uptime}%
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </Card>

      {/* Graphiques de performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latence API</h3>
          {/* TODO: Ajouter le graphique de latence */}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Requêtes/sec</h3>
          {/* TODO: Ajouter le graphique de requêtes */}
        </Card>
      </div>

      {/* Journal des incidents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Journal des Incidents</h3>
        {/* TODO: Ajouter la liste des incidents */}
      </Card>
    </div>
  );
}
