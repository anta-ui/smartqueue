"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueueWebSocket } from "@/hooks/queue/useQueueWebSocket";
import { useQueueHistory } from "@/hooks/queue/useQueueHistory";
import { useQueueFavorites } from "@/hooks/queue/useQueueFavorites";
import { useQueueNotifications } from "@/hooks/queue/useQueueNotifications";
import { useQueueCalendar } from "@/hooks/queue/useQueueCalendar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  BellIcon,
  BellSlashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarIconOutline,
} from "@heroicons/react/24/outline";
import { TicketProgress } from "@/components/features/client/TicketProgress";
import { QueueGroup } from "@/components/features/client/QueueGroup";
import type { Queue, Ticket } from "@/types/queue";

export default function QueuePage() {
  const params = useParams();
  const router = useRouter();
  const { addToHistory } = useQueueHistory();
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    updateFavoriteStats,
  } = useQueueFavorites();
  const {
    hasPermission,
    subscribeToQueue,
    unsubscribeFromQueue,
  } = useQueueNotifications();
  const { addToCalendar } = useQueueCalendar();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isFav, setIsFav] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  useQueueWebSocket({
    queueId: params.id as string,
    onQueueUpdate: (updatedQueue) => {
      setQueue(updatedQueue);
    },
    onTicketUpdated: (updatedTicket) => {
      if (ticket && ticket.id === updatedTicket.id) {
        setTicket(updatedTicket);
      }
    },
  });

  useEffect(() => {
    loadQueueData();
  }, [params.id]);

  useEffect(() => {
    if (queue) {
      setIsFav(isFavorite(queue.id));
      updateFavoriteStats(queue.id);
    }
  }, [queue]);

  const loadQueueData = async () => {
    try {
      const response = await fetch(`/api/queues/${params.id}`);
      const data = await response.json();
      setQueue(data);
      addToHistory(data);
    } catch (error) {
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!queue) return;

    if (isFav) {
      removeFromFavorites(queue.id);
      if (hasNotifications) {
        await unsubscribeFromQueue(queue.id);
        setHasNotifications(false);
      }
    } else {
      addToFavorites(queue);
      if (hasPermission) {
        await subscribeToQueue(queue.id);
        setHasNotifications(true);
      }
    }
    setIsFav(!isFav);
  };

  const toggleNotifications = async () => {
    if (!queue) return;

    try {
      if (hasNotifications) {
        await unsubscribeFromQueue(queue.id);
      } else {
        await subscribeToQueue(queue.id);
      }
      setHasNotifications(!hasNotifications);
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queue) return;

    try {
      const response = await fetch(`/api/queues/${queue.id}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const ticket = await response.json();
      setTicket(ticket);

      // Demander la permission pour les notifications push
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // Enregistrer le device pour les notifications
          await registerForPushNotifications(ticket.id);
        }
      }
    } catch (error) {
      setError("Failed to join queue");
    }
  };

  const registerForPushNotifications = async (ticketId: string) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/notifications/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          subscription,
        }),
      });
    } catch (error) {
      console.error("Failed to register for push notifications:", error);
    }
  };

  const handleShare = async () => {
    if (!queue) return;

    try {
      await navigator.share({
        title: "SmartQueue - " + queue.name,
        text: `Rejoignez-moi dans la file d'attente "${queue.name}" !`,
        url: `https://smartqueue.app/q/${queue.id}`,
      });
    } catch (error) {
      console.debug("Share failed:", error);
    }
  };

  const handleAddToCalendar = async () => {
    if (!queue || !ticket || !ticket.estimatedCallTime) return;

    try {
      await addToCalendar(queue, new Date(ticket.estimatedCallTime));
    } catch (error) {
      console.error("Failed to add to calendar:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="p-4 bg-yellow-50 rounded-md">
        <p className="text-yellow-700">File non trouvée</p>
      </div>
    );
  }

  if (ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white shadow-sm px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600"
            >
              ← Retour
            </Button>
            <h1 className="text-lg font-semibold">{queue.name}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className="text-gray-600"
              >
                {isFav ? (
                  <StarIconSolid className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarIconOutline className="h-5 w-5" />
                )}
              </Button>
              {isFav && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleNotifications}
                  className="text-gray-600"
                >
                  {hasNotifications ? (
                    <BellIconSolid className="h-5 w-5 text-indigo-500" />
                  ) : (
                    <BellIcon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600"
              >
                <ShareIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Votre ticket</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAddToCalendar}
                    className="text-gray-600"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TicketProgress
                ticket={ticket}
                estimatedCallTime={
                  ticket.estimatedCallTime
                    ? new Date(ticket.estimatedCallTime)
                    : undefined
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <QueueGroup queueId={params.id as string} />
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <Button
                variant="outline"
                className="flex-1 mr-2"
                onClick={() => router.push("/")}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                className="flex-1 ml-2"
                onClick={() => window.location.reload()}
              >
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600"
          >
            ← Retour
          </Button>
          <h1 className="text-lg font-semibold">{queue.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className="text-gray-600"
            >
              {isFav ? (
                <StarIconSolid className="h-5 w-5 text-yellow-500" />
              ) : (
                <StarIconOutline className="h-5 w-5" />
              )}
            </Button>
            {isFav && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotifications}
                className="text-gray-600"
              >
                {hasNotifications ? (
                  <BellIconSolid className="h-5 w-5 text-indigo-500" />
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-600"
            >
              <ShareIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{queue.name}</h1>
          <p className="mt-2 text-gray-600">{queue.description}</p>
        </div>

        <Card>
          <CardContent>
            <QueueGroup queueId={params.id as string} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Join the Queue</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <Button type="submit" className="w-full">
                Get in Line
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
