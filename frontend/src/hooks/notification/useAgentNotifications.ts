import { useEffect } from "react";
import { useNotifications } from "./useNotifications";
import type { Notification, AgentNotificationMetadata } from "@/types/notification";
import type { ServicePoint } from "@/types/queue";

export function useAgentNotifications(servicePoint: ServicePoint) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Filtrer les notifications pertinentes pour l'agent
  const agentNotifications = notifications.filter((notification) => {
    if (
      !["agent_queue", "agent_ticket", "agent_service_point"].includes(
        notification.category
      )
    ) {
      return false;
    }

    const metadata = notification.metadata as AgentNotificationMetadata;
    return metadata.servicePointId === servicePoint.id;
  });

  // Notifications prioritaires (tickets urgents, files d'attente longues)
  const priorityNotifications = agentNotifications.filter(
    (n) => n.priority === "high" || n.priority === "urgent"
  );

  // Notifications liées au ticket en cours
  const currentTicketNotifications = agentNotifications.filter((n) => {
    const metadata = n.metadata as AgentNotificationMetadata;
    return (
      metadata.ticketId === servicePoint.currentTicket?.id &&
      n.category === "agent_ticket"
    );
  });

  // Notifications de la file d'attente
  const queueNotifications = agentNotifications.filter(
    (n) => n.category === "agent_queue"
  );

  // Notifications du point de service
  const servicePointNotifications = agentNotifications.filter(
    (n) => n.category === "agent_service_point"
  );

  return {
    notifications: agentNotifications,
    priorityNotifications,
    currentTicketNotifications,
    queueNotifications,
    servicePointNotifications,
    unreadCount: agentNotifications.filter((n) => !n.status.read).length,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
