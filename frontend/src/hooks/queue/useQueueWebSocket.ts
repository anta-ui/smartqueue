"use client";

import { useEffect, useCallback } from "react";
import { wsService } from "@/services/socket";
import type { Queue, Ticket } from "@/types/queue";

interface UseQueueWebSocketProps {
  queueId: string;
  onQueueUpdate?: (queue: Queue) => void;
  onTicketCreated?: (ticket: Ticket) => void;
  onTicketUpdated?: (ticket: Ticket) => void;
  onTicketCalled?: (ticket: Ticket) => void;
}

export function useQueueWebSocket({
  queueId,
  onQueueUpdate,
  onTicketCreated,
  onTicketUpdated,
  onTicketCalled,
}: UseQueueWebSocketProps) {
  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsService.connect();

    return () => {
      // Cleanup WebSocket connection when component unmounts
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    // Subscribe to queue events
    wsService.subscribeToQueue(queueId);

    const unsubscribeQueue = onQueueUpdate
      ? wsService.subscribe("queue:updated", onQueueUpdate)
      : undefined;

    const unsubscribeTicketCreated = onTicketCreated
      ? wsService.subscribe("ticket:created", onTicketCreated)
      : undefined;

    const unsubscribeTicketUpdated = onTicketUpdated
      ? wsService.subscribe("ticket:updated", onTicketUpdated)
      : undefined;

    const unsubscribeTicketCalled = onTicketCalled
      ? wsService.subscribe("ticket:called", onTicketCalled)
      : undefined;

    return () => {
      // Cleanup subscriptions when queueId changes or component unmounts
      wsService.unsubscribeFromQueue(queueId);
      unsubscribeQueue?.();
      unsubscribeTicketCreated?.();
      unsubscribeTicketUpdated?.();
      unsubscribeTicketCalled?.();
    };
  }, [queueId, onQueueUpdate, onTicketCreated, onTicketUpdated, onTicketCalled]);
}
