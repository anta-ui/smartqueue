import type { NotificationTemplate } from "@/types/notification";

export const agentNotificationTemplates: NotificationTemplate[] = [
  // Notifications de file d'attente
  {
    id: "queue_threshold_reached",
    name: "Seuil de file d'attente atteint",
    description: "Alerte lorsque le temps d'attente dépasse un seuil",
    category: "agent_queue",
    channels: ["in_app", "email"],
    subject: "Temps d'attente élevé",
    content: "Le temps d'attente dans la file {{queueName}} a dépassé {{threshold}} minutes. {{waitingCount}} personnes en attente.",
    variables: ["queueName", "threshold", "waitingCount"],
    active: true,
    metadata: {
      priority: "high",
      icon: "alert-triangle"
    }
  },
  {
    id: "queue_status_update",
    name: "Mise à jour statut file",
    description: "Informations sur les changements de statut de la file",
    category: "agent_queue",
    channels: ["in_app"],
    subject: "Statut de la file mis à jour",
    content: "La file {{queueName}} est maintenant {{status}}. {{additionalInfo}}",
    variables: ["queueName", "status", "additionalInfo"],
    active: true,
    metadata: {
      priority: "medium",
      icon: "info"
    }
  },

  // Notifications de tickets
  {
    id: "new_priority_ticket",
    name: "Nouveau ticket prioritaire",
    description: "Alerte pour les tickets prioritaires ou urgents",
    category: "agent_ticket",
    channels: ["in_app", "email"],
    subject: "Nouveau ticket prioritaire",
    content: "Un nouveau ticket prioritaire a été créé pour {{customerName}}. Motif : {{reason}}",
    variables: ["customerName", "reason"],
    active: true,
    metadata: {
      priority: "urgent",
      icon: "alert-circle"
    }
  },
  {
    id: "ticket_transfer",
    name: "Transfert de ticket",
    description: "Notification de transfert de ticket",
    category: "agent_ticket",
    channels: ["in_app"],
    subject: "Ticket transféré",
    content: "Le ticket #{{ticketId}} a été transféré à votre point de service par {{agentName}}",
    variables: ["ticketId", "agentName"],
    active: true,
    metadata: {
      priority: "medium",
      icon: "arrow-right"
    }
  },

  // Notifications de point de service
  {
    id: "service_point_status",
    name: "Statut point de service",
    description: "Changements de statut du point de service",
    category: "agent_service_point",
    channels: ["in_app"],
    subject: "Statut point de service",
    content: "Votre point de service passera en {{status}} dans {{timeLeft}} minutes",
    variables: ["status", "timeLeft"],
    active: true,
    metadata: {
      priority: "low",
      icon: "clock"
    }
  },
  {
    id: "performance_alert",
    name: "Alerte de performance",
    description: "Alertes sur les métriques de performance",
    category: "agent_service_point",
    channels: ["in_app", "email"],
    subject: "Alerte de performance",
    content: "Votre temps de service moyen ({{avgServiceTime}} min) dépasse l'objectif ({{targetTime}} min)",
    variables: ["avgServiceTime", "targetTime"],
    active: true,
    metadata: {
      priority: "high",
      icon: "activity"
    }
  }
];
