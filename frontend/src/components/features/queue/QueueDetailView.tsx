"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQueueWebSocket } from "@/hooks/queue/useQueueWebSocket";
import type { Queue, Ticket, ServicePoint } from "@/types/queue";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface QueueDetailViewProps {
  queue: Queue;
  onStatusChange: (status: Queue["status"]) => Promise<void>;
}

export function QueueDetailView({ queue, onStatusChange }: QueueDetailViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [stats, setStats] = useState({
    averageWaitTime: 0,
    servedToday: 0,
    noShowRate: 0,
  });
  const { toast } = useToast();

  // Colonnes pour la table des tickets
  const ticketColumns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "number",
      header: "Numéro",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "WAITING"
              ? "default"
              : row.original.status === "CALLED"
              ? "warning"
              : row.original.status === "SERVING"
              ? "success"
              : "destructive"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "priorityLevel",
      header: "Priorité",
      cell: ({ row }) => (
        <Badge variant={row.original.priorityLevel > 0 ? "warning" : "default"}>
          {row.original.priorityLevel > 0 ? "Prioritaire" : "Normal"}
        </Badge>
      ),
    },
    {
      accessorKey: "estimatedWaitTime",
      header: "Temps d'attente estimé",
      cell: ({ row }) => `${row.original.estimatedWaitTime} min`,
    },
    {
      accessorKey: "checkInTime",
      header: "Heure d'arrivée",
      cell: ({ row }) =>
        new Date(row.original.checkInTime).toLocaleTimeString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCallTicket(row.original.id)}
            disabled={row.original.status !== "WAITING"}
          >
            Appeler
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleCancelTicket(row.original.id)}
            disabled={
              !["WAITING", "CALLED"].includes(row.original.status as string)
            }
          >
            Annuler
          </Button>
        </div>
      ),
    },
  ];

  // WebSocket pour les mises à jour en temps réel
  useQueueWebSocket({
    queueId: queue.id,
    onQueueUpdate: (updatedQueue) => {
      // Mise à jour des stats de la file
      setStats((prev) => ({
        ...prev,
        averageWaitTime: updatedQueue.currentWaitTime,
      }));
    },
    onTicketCreated: (newTicket) => {
      setTickets((prev) => [...prev, newTicket]);
      toast({
        title: "Nouveau ticket",
        description: `Ticket #${newTicket.number} créé`,
      });
    },
    onTicketUpdated: (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    },
  });

  // Charger les données initiales
  useEffect(() => {
    const loadQueueData = async () => {
      try {
        const [ticketsData, servicePointsData, statsData] = await Promise.all([
          fetch(`/api/queues/${queue.id}/tickets`).then((r) => r.json()),
          fetch(`/api/queues/${queue.id}/service-points`).then((r) => r.json()),
          fetch(`/api/queues/${queue.id}/stats`).then((r) => r.json()),
        ]);

        setTickets(ticketsData);
        setServicePoints(servicePointsData);
        setStats(statsData);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la file",
          variant: "destructive",
        });
      }
    };

    loadQueueData();
  }, [queue.id]);

  const handleCallTicket = async (ticketId: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}/call`, { method: "POST" });
      toast({
        title: "Ticket appelé",
        description: "Le client a été notifié",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'appeler le ticket",
        variant: "destructive",
      });
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}/cancel`, { method: "POST" });
      toast({
        title: "Ticket annulé",
        description: "Le ticket a été annulé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions rapides */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{queue.name}</h2>
          <p className="text-gray-500">
            Type: {queue.type} • Priorité:{" "}
            {queue.isPriority ? "Oui" : "Non"}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant={queue.status === "ACTIVE" ? "destructive" : "default"}
            onClick={() =>
              onStatusChange(
                queue.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
              )
            }
          >
            {queue.status === "ACTIVE" ? "Mettre en pause" : "Activer"}
          </Button>
          <Button variant="outline" onClick={() => onStatusChange("MAINTENANCE")}>
            Maintenance
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Temps d'attente moyen</p>
            <p className="text-2xl font-bold">{stats.averageWaitTime} min</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Clients servis aujourd'hui</p>
            <p className="text-2xl font-bold">{stats.servedToday}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Taux de non-présentation</p>
            <p className="text-2xl font-bold">{stats.noShowRate}%</p>
          </div>
        </Card>
      </div>

      {/* Points de service */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Points de Service</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {servicePoints.map((point) => (
            <div
              key={point.id}
              className="p-3 border rounded-lg flex flex-col items-center"
            >
              <p className="font-medium">{point.name}</p>
              <Badge
                variant={
                  point.status === "AVAILABLE"
                    ? "success"
                    : point.status === "BUSY"
                    ? "warning"
                    : "destructive"
                }
              >
                {point.status}
              </Badge>
              {point.currentTicket && (
                <p className="text-sm text-gray-500 mt-2">
                  Ticket #{point.currentTicket.number}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Liste des tickets */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tickets</h3>
        <DataTable columns={ticketColumns} data={tickets} />
      </Card>
    </div>
  );
}
