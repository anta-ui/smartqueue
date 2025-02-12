"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useQueueWebSocket } from "@/hooks/queue/useQueueWebSocket";
import type { ServicePoint, Ticket, Queue } from "@/types/queue";
import { Timer } from "@/components/ui/timer";
import { useAgentNotifications } from "@/hooks/notification/useAgentNotifications";
import { BellIcon } from "@heroicons/react/24/outline";
import { Menu } from "@/components/ui/menu";
import { NotificationItem } from "@/components/ui/notification-item";
import { usePushNotifications } from "@/hooks/notification/usePushNotifications";

interface AgentDashboardProps {
  servicePoint: ServicePoint;
}

export function AgentDashboard({ servicePoint }: AgentDashboardProps) {
  const [status, setStatus] = useState(servicePoint.status);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(
    servicePoint.currentTicket || null
  );
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [serviceStartTime, setServiceStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const {
    notifications,
    priorityNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useAgentNotifications(servicePoint);

  const {
    permission,
    loading: pushLoading,
    requestPermission,
    supported,
  } = usePushNotifications();

  // WebSocket pour les mises à jour en temps réel
  useQueueWebSocket({
    queueId: queue?.id || "",
    onQueueUpdate: (updatedQueue) => {
      setQueue(updatedQueue);
    },
    onTicketCreated: (newTicket) => {
      setWaitingTickets((prev) => [...prev, newTicket]);
      toast({
        title: "Nouveau ticket",
        description: `Ticket #${newTicket.number} ajouté à la file`,
      });
    },
    onTicketUpdated: (updatedTicket) => {
      if (currentTicket?.id === updatedTicket.id) {
        setCurrentTicket(updatedTicket);
      } else {
        setWaitingTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
        );
      }
    },
  });

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [queueData, ticketsData] = await Promise.all([
          fetch(`/api/service-points/${servicePoint.id}/queue`).then((r) =>
            r.json()
          ),
          fetch(`/api/service-points/${servicePoint.id}/waiting-tickets`).then(
            (r) => r.json()
          ),
        ]);
        setQueue(queueData);
        setWaitingTickets(ticketsData);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [servicePoint.id]);

  const handleStatusChange = async (newStatus: ServicePoint["status"]) => {
    try {
      await fetch(`/api/service-points/${servicePoint.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      toast({
        title: "Statut mis à jour",
        description: `Votre statut est maintenant : ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleCallNext = async () => {
    if (currentTicket || status !== "AVAILABLE") return;

    try {
      const response = await fetch(
        `/api/service-points/${servicePoint.id}/call-next`,
        {
          method: "POST",
        }
      );
      const ticket = await response.json();
      setCurrentTicket(ticket);
      setServiceStartTime(new Date());
      toast({
        title: "Nouveau client",
        description: `Le ticket #${ticket.number} a été appelé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'appeler le prochain ticket",
        variant: "destructive",
      });
    }
  };

  const handleCompleteService = async () => {
    if (!currentTicket) return;

    try {
      await fetch(`/api/tickets/${currentTicket.id}/complete`, {
        method: "POST",
      });
      setCurrentTicket(null);
      setServiceStartTime(null);
      toast({
        title: "Service terminé",
        description: `Le ticket #${currentTicket.number} a été marqué comme terminé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer le service",
        variant: "destructive",
      });
    }
  };

  const handleTransferTicket = async (targetServicePointId: string) => {
    if (!currentTicket) return;

    try {
      await fetch(`/api/tickets/${currentTicket.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicePointId: targetServicePointId }),
      });
      setCurrentTicket(null);
      setServiceStartTime(null);
      toast({
        title: "Ticket transféré",
        description: `Le ticket #${currentTicket.number} a été transféré`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de transférer le ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et notifications */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{servicePoint.name}</h2>
          <Badge
            variant={
              status === "AVAILABLE"
                ? "success"
                : status === "BUSY"
                ? "warning"
                : "destructive"
            }
          >
            {status}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          {supported && permission !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              disabled={pushLoading}
            >
              <BellIcon className="h-4 w-4 mr-2" />
              Activer les notifications
            </Button>
          )}

          <Menu as="div" className="relative">
            <Menu.Button className="relative rounded-full p-2 hover:bg-gray-100">
              <BellIcon className="h-6 w-6 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                {priorityNotifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-red-600 mb-1">
                      Prioritaires
                    </h4>
                    {priorityNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markAsRead}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Aucune notification
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markAsRead}
                      />
                    ))
                  )}
                </div>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {/* Client actuel */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Client Actuel</h3>
        {currentTicket ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">#{currentTicket.number}</p>
                <p className="text-sm text-gray-500">
                  Priorité:{" "}
                  <Badge
                    variant={currentTicket.priorityLevel > 0 ? "warning" : "default"}
                  >
                    {currentTicket.priorityLevel > 0 ? "Prioritaire" : "Normal"}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Temps de service</p>
                {serviceStartTime && (
                  <Timer startTime={serviceStartTime} className="text-lg" />
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleCompleteService}
              >
                Terminer
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleTransferTicket("autre-guichet")}
              >
                Transférer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun client en cours</p>
            <Button
              variant="default"
              className="mt-4"
              onClick={handleCallNext}
              disabled={status !== "AVAILABLE" || waitingTickets.length === 0}
            >
              Appeler le suivant
            </Button>
          </div>
        )}
      </Card>

      {/* File d'attente */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">
          File d'attente ({waitingTickets.length})
        </h3>
        <div className="space-y-2">
          {waitingTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">#{ticket.number}</p>
                <p className="text-sm text-gray-500">
                  Attente: {ticket.estimatedWaitTime} min
                </p>
              </div>
              <Badge
                variant={ticket.priorityLevel > 0 ? "warning" : "default"}
              >
                {ticket.priorityLevel > 0 ? "Prioritaire" : "Normal"}
              </Badge>
            </div>
          ))}
          {waitingTickets.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Aucun ticket en attente
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
