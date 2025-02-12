"use client";

import { useState, useEffect } from "react";
import { useQueueFavorites } from "./useQueueFavorites";

interface UseQueueNotificationsReturn {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  subscribeToQueue: (queueId: string) => Promise<void>;
  unsubscribeFromQueue: (queueId: string) => Promise<void>;
}

export function useQueueNotifications(): UseQueueNotificationsReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const { favorites } = useQueueFavorites();

  useEffect(() => {
    // Vérifier la permission au chargement
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  };

  const getSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Failed to get push subscription:", error);
      return null;
    }
  };

  const subscribeToQueue = async (queueId: string) => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
      }

      // Enregistrer l'abonnement pour cette file
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueId,
          subscription,
          preferences: {
            queueUpdates: true,
            waitTimeAlerts: true,
            statusChanges: true,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to subscribe to queue notifications:", error);
    }
  };

  const unsubscribeFromQueue = async (queueId: string) => {
    const subscription = await getSubscription();
    if (!subscription) return;

    try {
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueId,
          subscription: subscription.toJSON(),
        }),
      });

      // Si c'était la dernière file, supprimer l'abonnement push
      const isLastQueue = !favorites.some(
        (fav) => fav.id !== queueId && fav.hasNotifications
      );
      
      if (isLastQueue) {
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.error("Failed to unsubscribe from queue notifications:", error);
    }
  };

  return {
    hasPermission,
    requestPermission,
    subscribeToQueue,
    unsubscribeFromQueue,
  };
}
