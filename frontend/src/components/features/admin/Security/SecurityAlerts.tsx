"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import type { SecurityAlert } from "@/types/security";

export default function SecurityAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: alerts, loading, refresh } = useCache<SecurityAlert[]>({
    key: "security_alerts",
    fetchData: async () => {
      const response = await fetch("/api/admin/security/alerts");
      return response.json();
    },
  });

  const handleStatusUpdate = async (
    alertId: string,
    newStatus: SecurityAlert["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/security/alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to update alert status:", error);
    }
  };

  const filteredAlerts = alerts?.filter((alert) => {
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter)
      return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Alertes de Sécurité</h2>
            <p className="text-sm text-gray-500">
              Surveillez et gérez les alertes de sécurité
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="open">Ouverts</SelectItem>
                <SelectItem value="investigating">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="false_positive">Faux positif</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts?.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    {new Date(alert.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{alert.type}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {alert.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "high"
                          ? "warning"
                          : "default"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.status === "resolved"
                          ? "success"
                          : alert.status === "investigating"
                          ? "warning"
                          : alert.status === "false_positive"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Alerte</DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="mt-1">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="mt-1">{selectedAlert.type}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="mt-1">{selectedAlert.description}</p>
              </div>

              {selectedAlert.affectedUsers && (
                <div>
                  <label className="text-sm font-medium">
                    Utilisateurs Affectés
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedAlert.affectedUsers.map((user) => (
                      <Badge key={user} variant="outline">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlert.affectedResources && (
                <div>
                  <label className="text-sm font-medium">
                    Ressources Affectées
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedAlert.affectedResources.map((resource) => (
                      <Badge key={resource} variant="outline">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={selectedAlert.status}
                  onValueChange={(value) =>
                    handleStatusUpdate(
                      selectedAlert.id,
                      value as SecurityAlert["status"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="investigating">En cours</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="false_positive">Faux positif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedAlert.resolution && (
                <div>
                  <label className="text-sm font-medium">Résolution</label>
                  <p className="mt-1">{selectedAlert.resolution}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
