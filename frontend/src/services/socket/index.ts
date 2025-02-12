import { io, Socket } from "socket.io-client";
import type { Queue, Ticket } from "@/types/queue";

interface ServerToClientEvents {
  "queue:updated": (queue: Queue) => void;
  "ticket:created": (ticket: Ticket) => void;
  "ticket:updated": (ticket: Ticket) => void;
  "ticket:called": (ticket: Ticket) => void;
}

interface ClientToServerEvents {
  "queue:subscribe": (queueId: string) => void;
  "queue:unsubscribe": (queueId: string) => void;
}

class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    // Set up event listeners
    this.socket.on("queue:updated", (queue) => {
      this.notify("queue:updated", queue);
    });

    this.socket.on("ticket:created", (ticket) => {
      this.notify("ticket:created", ticket);
    });

    this.socket.on("ticket:updated", (ticket) => {
      this.notify("ticket:updated", ticket);
    });

    this.socket.on("ticket:called", (ticket) => {
      this.notify("ticket:called", ticket);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToQueue(queueId: string) {
    if (this.socket?.connected) {
      this.socket.emit("queue:subscribe", queueId);
    }
  }

  unsubscribeFromQueue(queueId: string) {
    if (this.socket?.connected) {
      this.socket.emit("queue:unsubscribe", queueId);
    }
  }

  subscribe<T = any>(event: string, callback: (data: T) => void) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    this.subscriptions.get(event)?.add(callback);

    return () => {
      this.subscriptions.get(event)?.delete(callback);
    };
  }

  private notify(event: string, data: any) {
    this.subscriptions.get(event)?.forEach((callback) => {
      callback(data);
    });
  }
}

export const wsService = new WebSocketService();
