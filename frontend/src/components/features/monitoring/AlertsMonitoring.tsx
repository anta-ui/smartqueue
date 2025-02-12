"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  BellIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  status: "active" | "resolved" | "acknowledged";
  timestamp: Date;
  service: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-1",
    title: "Latence API élevée",
    message: "La latence moyenne de l'API dépasse 200ms",
    severity: "warning",
    status: "active",
    timestamp: new Date(),
    service: "API REST",
  },
  {
    id: "alert-2",
    title: "Erreur Base de données",
    message: "Taux d'erreur de connexion > 5%",
    severity: "critical",
    status: "acknowledged",
    timestamp: new Date(Date.now() - 3600000),
    service: "Base de données",
  },
  {
    id: "alert-3",
    title: "Utilisation CPU élevée",
    message: "Utilisation CPU > 80%",
    severity: "warning",
    status: "resolved",
    timestamp: new Date(Date.now() - 7200000),
    service: "Serveur principal",
  },
];

export default function AlertsMonitoring() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState("all");

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusIcon = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "acknowledged":
        return <BellIcon className="h-5 w-5" />;
      case "resolved":
        return <CheckCircleIcon className="h-5 w-5" />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alertes</h2>
          <p className="text-sm text-muted-foreground">
            Gérez et surveillez les alertes système
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les alertes</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="acknowledged">Reconnues</SelectItem>
            <SelectItem value="resolved">Résolues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Résumé des alertes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alertes actives</p>
              <h3 className="text-2xl font-bold">
                {alerts.filter((a) => a.status === "active").length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <h3 className="text-2xl font-bold">
                {alerts.filter((a) => a.status === "acknowledged").length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Résolues (24h)</p>
              <h3 className="text-2xl font-bold">
                {
                  alerts.filter(
                    (a) =>
                      a.status === "resolved" &&
                      a.timestamp > new Date(Date.now() - 86400000)
                  ).length
                }
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des alertes */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.status)}
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>{alert.service}</TableCell>
                <TableCell className="font-medium">{alert.title}</TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>
                  {format(alert.timestamp, "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {alert.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAlerts((prev) =>
                            prev.map((a) =>
                              a.id === alert.id
                                ? { ...a, status: "acknowledged" }
                                : a
                            )
                          )
                        }
                      >
                        Reconnaître
                      </Button>
                    )}
                    {alert.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAlerts((prev) =>
                            prev.map((a) =>
                              a.id === alert.id
                                ? { ...a, status: "resolved" }
                                : a
                            )
                          )
                        }
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
