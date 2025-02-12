"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComputerDesktopIcon,
  UserIcon,
  BoltIcon,
  ClockIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

interface ServicePoint {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  currentAgent?: {
    id: string;
    name: string;
    status: "available" | "busy" | "break";
  };
  currentTicket?: {
    number: string;
    customerName: string;
    startTime: string;
    duration: number;
  };
  metrics: {
    servedToday: number;
    avgServiceTime: number;
    efficiency: number;
  };
}

const MOCK_SERVICE_POINTS: ServicePoint[] = [
  {
    id: "SP1",
    name: "Guichet 1",
    status: "active",
    currentAgent: {
      id: "A1",
      name: "Jean Martin",
      status: "busy",
    },
    currentTicket: {
      number: "A001",
      customerName: "Pierre Dupont",
      startTime: "2025-01-29T14:30:00Z",
      duration: 15,
    },
    metrics: {
      servedToday: 25,
      avgServiceTime: 12,
      efficiency: 85,
    },
  },
  {
    id: "SP2",
    name: "Guichet 2",
    status: "active",
    currentAgent: {
      id: "A2",
      name: "Marie Dubois",
      status: "available",
    },
    metrics: {
      servedToday: 18,
      avgServiceTime: 15,
      efficiency: 78,
    },
  },
  {
    id: "SP3",
    name: "Guichet 3",
    status: "maintenance",
    metrics: {
      servedToday: 0,
      avgServiceTime: 0,
      efficiency: 0,
    },
  },
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800",
};

const agentStatusColors = {
  available: "text-green-500",
  busy: "text-yellow-500",
  break: "text-gray-500",
};

export default function ServicePointManager() {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>(
    MOCK_SERVICE_POINTS
  );
  const [selectedPoint, setSelectedPoint] = useState<ServicePoint | null>(null);

  const handleStatusChange = (pointId: string, status: ServicePoint["status"]) => {
    setServicePoints((prev) =>
      prev.map((point) =>
        point.id === pointId ? { ...point, status } : point
      )
    );
  };

  const handleAgentStatusChange = (
    pointId: string,
    status: ServicePoint["currentAgent"]["status"]
  ) => {
    setServicePoints((prev) =>
      prev.map((point) =>
        point.id === pointId && point.currentAgent
          ? {
              ...point,
              currentAgent: { ...point.currentAgent, status },
            }
          : point
      )
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Liste des points de service */}
      <div className="col-span-8">
        <div className="grid gap-4">
          {servicePoints.map((point) => (
            <Card
              key={point.id}
              className={`p-6 cursor-pointer transition-colors ${
                selectedPoint?.id === point.id
                  ? "border-primary"
                  : "hover:border-muted"
              }`}
              onClick={() => setSelectedPoint(point)}
            >
              <div className="flex items-start justify-between">
                {/* Informations principales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <ComputerDesktopIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{point.name}</h3>
                      <Badge
                        variant="secondary"
                        className={statusColors[point.status]}
                      >
                        {point.status}
                      </Badge>
                    </div>
                  </div>

                  {point.currentAgent && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span>{point.currentAgent.name}</span>
                      <Badge
                        variant="outline"
                        className={agentStatusColors[point.currentAgent.status]}
                      >
                        {point.currentAgent.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Servis aujourd'hui
                    </p>
                    <p className="text-2xl font-bold">
                      {point.metrics.servedToday}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Temps moyen
                    </p>
                    <p className="text-2xl font-bold">
                      {point.metrics.avgServiceTime}min
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Efficacité
                    </p>
                    <p className="text-2xl font-bold">
                      {point.metrics.efficiency}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket en cours */}
              {point.currentTicket && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        #{point.currentTicket.number} -{" "}
                        {point.currentTicket.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ClockIcon className="h-4 w-4" />
                      {point.currentTicket.duration}min
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Panneau de contrôle */}
      <div className="col-span-4">
        {selectedPoint ? (
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">
              Contrôle - {selectedPoint.name}
            </h3>

            {/* Status du point de service */}
            <div className="space-y-4 mb-6">
              <label className="text-sm text-muted-foreground">
                État du point de service
              </label>
              <Select
                value={selectedPoint.status}
                onValueChange={(value: ServicePoint["status"]) =>
                  handleStatusChange(selectedPoint.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contrôles de l'agent */}
            {selectedPoint.currentAgent && (
              <div className="space-y-4 mb-6">
                <label className="text-sm text-muted-foreground">
                  État de l'agent
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      selectedPoint.currentAgent.status === "available"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      handleAgentStatusChange(selectedPoint.id, "available")
                    }
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Disponible
                  </Button>
                  <Button
                    variant={
                      selectedPoint.currentAgent.status === "break"
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      handleAgentStatusChange(selectedPoint.id, "break")
                    }
                  >
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" disabled={!selectedPoint.currentAgent}>
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Appeler prochain ticket
              </Button>
              <Button variant="outline" className="w-full">
                Transférer file
              </Button>
              <Button variant="outline" className="w-full">
                Fermer le point
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 h-[400px] flex items-center justify-center">
            <div className="text-center">
              <ComputerDesktopIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sélectionnez un point de service
              </h3>
              <p className="text-muted-foreground">
                Cliquez sur un guichet pour le gérer
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
